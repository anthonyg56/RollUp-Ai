import { Logger } from "winston";
import * as fs from "node:fs/promises";
import * as path from "node:path";
import { tmpdir } from "node:os";
import { filesystemLogger } from "@server/lib/configs/logger";
import { createReadStream, createWriteStream } from "node:fs";
import type { ReadStream, WriteStream } from "node:fs";

export class FileServiceError extends Error {
  public readonly error?: Error;

  constructor(message: string, error?: Error) {
    super(message);
    this.name = 'FileServiceError';
    this.error = error;
  }
}

export class FileService {
  private rootPath: string = tmpdir();
  public initalizedRepositories: string[] = [];
  private readonly logger: Logger = filesystemLogger;

  getRepositoryPath(repositoryPath: string) {
    const isInitalized = this.verifyRepository(repositoryPath);

    if (!isInitalized) {
      throw new FileServiceError(`Repository not initalized`);
    }

    const resolvedPath = this.resolvePaths(repositoryPath).resolvedPath;

    if (!resolvedPath) {
      throw new FileServiceError(`Repository path not found`);
    }

    return resolvedPath;
  }

  verifyRepository(repositoryPath: string) {
    return this.initalizedRepositories.includes(repositoryPath);
  };

  async inializeRepository(relativePath: string) {
    const isInitalized = this.verifyRepository(relativePath);

    if (isInitalized) {
      return;
    }

    await this.createPath(relativePath);

    this.initalizedRepositories.push(relativePath);
  };

  async deleteRepository(repositoryPath: string, throwError: boolean = true) {
    if (!this.verifyRepository(repositoryPath)) {
      if (throwError) {
        throw new FileServiceError(`Repository not initalized`);
      } else {
        return;
      }
    }

    await this.deletePath(repositoryPath);
  }

  async dumpRepository() {
    if (this.initalizedRepositories.length === 0) {
      throw new FileServiceError(`No repositories initalized`);
    }

    this.initalizedRepositories.forEach(async (repositoryPath) => {
      await this.deleteRepository(repositoryPath, false);
    });
  }

  /**
   * Creates a directory at the given relative path.
   * Relative path cannot contain a basename due to mkdir's behavior.
   * 
   * @param relativePath Path to the directory to create.
   * @throws {FileServiceError} If the path contains a basename.
   * @throws {FileServiceError} If the path doesnt exists after creation.
   * @returns The absolute path to the created directory.
   */
  async createPath(relativePath: string) {
    this.checkForBasename(relativePath);

    const { resolvedPath } = this.resolvePaths(relativePath);

    this.logger.info(`initializing path at: ${resolvedPath}`);

    await fs.mkdir(resolvedPath, { recursive: true })
      .catch(err => {
        if (err instanceof Error)
          throw new FileServiceError(`Error creating path at: ${resolvedPath}`);
      });

    const isDir = await this.pathExists(resolvedPath, false);

    if (!isDir) {
      throw new FileServiceError(`Unable to create path at: ${resolvedPath}`);
    };

    this.logger.info(`Path created at: ${resolvedPath}`);
  };



  /**
   * Creates an empty file at the given relative path.
   * 
   * @param relativePath The relative path to the file.
   * @param fileName The name of the file to create.
   * @param content The content to write to the file.
   * 
   * @throws {FileServiceError} If the file cannot be created.
   * @throws {FileServiceError} If the file cannot be written to.
   * 
   * @returns The absolute path to the created file.
   */
  async createEmptyFile(relativePath: string, fileName: string, content: string = '') {
    const { resolvedPath } = this.resolvePaths(relativePath);
    const filePath = path.join(resolvedPath, fileName);

    this.logger.info(`creating file at: ${filePath}`);

    await fs.writeFile(filePath, content)
      .catch(err => {
        throw new FileServiceError(`Error writing file at: ${filePath}`, err);
      });

    this.logger.info(`File created at: ${filePath}`);
  }

  /**
   * Checks if the given path exists. Throws on error by default.
   * 
   * @param path The path to check.
   * @param throwError Whether to throw an error if the path does not exist.
   * 
   * @throws {FileServiceError} If the path does not exist.
   * @throws {FileServiceError} If the path is empty.
   * @throws {FileServiceError} If `throwError` is true and there is an error checking if the directory exists.
   * 
   * @returns `true` if the path exists, `false` otherwise.
   */
  async pathExists(path: string, throwError: boolean = true) {
    if (!path || '') {
      throw new FileServiceError(`Path cannot be empty.`);
    };

    const { resolvedPath } = this.resolvePaths(path);

    const isDir = fs.exists(resolvedPath)
      .catch(err => {
        throw new FileServiceError(`Error checking path existence at: ${resolvedPath}`, err);
      });

    if (!isDir && throwError) {
      throw new FileServiceError(`Path does not exist: ${resolvedPath}`);
    } else if (!isDir && !throwError) {
      return false;
    } else {
      return true;
    };
  };

  /**
   * Resolves the given relative path to an absolute path connected to the repository.
   * 
   * @param relativePath The relative path to resolve.
   * @returns The absolute path.
   */
  resolvePaths(relativePath: string) {
    if (!this.rootPath) {
      throw new FileServiceError(`Absolute path not set.`);
    }

    const newRelativePath = path.join(this.rootPath, relativePath);
    const resolvedPath = path.resolve(newRelativePath);

    return {
      newRelativePath,
      resolvedPath,
    };
  };

  /**
   * Checks if the given relative path contains a basename.
   * 
   * @param relativePath The relative path to check.
   * @returns `true` if the path contains a basename, `false` otherwise.
   */
  checkForBasename(relativePath: string, throwError: boolean = true) {
    const { resolvedPath } = this.resolvePaths(relativePath);
    const basename = path.basename(resolvedPath);

    if (basename && throwError) {
      throw new FileServiceError(`Path cannot contain a basename.`);
    } else if (basename && !throwError) {
      return true;
    } else {
      return false;
    }
  };

  private checkIfResolved(relativePath: string) {
    if (!this.rootPath) {
      throw new FileServiceError(`Absolute path not set.`);
    }

    return relativePath.startsWith(this.rootPath);
  }

  private async deletePath(relativePath: string) {
    const { resolvedPath } = this.resolvePaths(relativePath);
    try {
      await fs.rm(resolvedPath, { recursive: true, force: true });
    } catch (err) {
      throw new FileServiceError(`Error deleting path at: ${resolvedPath}`, err as Error);
    }
  };

  async writeToEmptyFile(relativePath: string, content: string) {
    const { resolvedPath } = this.resolvePaths(relativePath);
    const basename = path.basename(resolvedPath);

    if (basename === '' || !basename) {
      throw new FileServiceError(`Path cannot contain a basename.`);
    }

    await fs.writeFile(resolvedPath, content);
  }

  /**
 * Reads the content of a file from the repository.
 *
 * @param relativePath The path relative to the repository (e.g., "config/settings.json").
 * @param encoding The file encoding to use (e.g., 'utf-8'). If null, returns a Buffer. Defaults to 'utf-8'.
 * @returns The content of the file (string or Buffer), or null if an error occurs (e.g., file not found).
 */
  public async readFile(relativePath: string, encoding: BufferEncoding | null = 'utf-8'): Promise<string | Buffer | null> {
    try {
      const { resolvedPath } = this.resolvePaths(relativePath);
      const options = encoding ? { encoding } : {};
      const content = await fs.readFile(resolvedPath, options);

      console.log(`Successfully read from file: ${relativePath}`);

      return content;
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        // console.log(`File not found: ${relativePath}`);
        // Deliberately not logging an error for file not found during read
      } else if (error instanceof FileServiceError) {
        this.logger.error(error.message);
      }
      else {
        this.logger.error(`Error reading file '${relativePath}':`, error.message || error);
      }
      return null;
    }
  }
}

export async function createStreamFromPath(inputPath: string, streamType: 'read'): Promise<ReadStream>;
export async function createStreamFromPath(inputPath: string, streamType: 'write'): Promise<WriteStream>;
export async function createStreamFromPath(inputPath: string, streamType: 'read' | 'write'): Promise<ReadStream | WriteStream>;

export async function createStreamFromPath(inputPath: string, streamType: 'read' | 'write') {
  if (streamType === 'read') {
    const stream = createReadStream(inputPath);

    stream.on('error', (error) => {
      stream.destroy();
      throw error;
    });

    return stream;
  } else {
    const stream = createWriteStream(inputPath);

    stream.on('error', (error) => {
      stream.destroy();
      throw error;
    });

    return stream;
  }
}

const RootFileService = new FileService();

export default RootFileService;
