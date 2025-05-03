import { AssetType } from "@server/lib/constants";
import type { FileService } from "@server/services/FileIO.service";

export class RepositoryError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RepositoryError";
  };
}

export type QueueAsset = {
  path: string;
  eTag?: string;
  assetId?: string;
};

export type AssetsRecord = Partial<{
  [key in AssetType]: QueueAsset;
}>;

export interface IAssetRepository {
  get assets(): AssetsRecord;
  get Path(): string;
  getAsset(assetType: AssetType): QueueAsset;
  createAsset(assetType: AssetType, filename: string): Promise<string>;
  getAssetKeyByPath(path: string): AssetType;
  removeAsset(assetType: AssetType): Promise<void>;
  createAssetPath(assetType: AssetType): Promise<string>;
  addAssetId(assetType: AssetType, assetId: string): void;
  addAssetETag(assetType: AssetType, eTag: string): void;
  writeContent(relativePath: string, content: string): Promise<void>;
  readContent(assetType: AssetType): Promise<string>;
};

export class AssetsRepository implements IAssetRepository {
  constructor(
    private readonly _path: string,
    private readonly _fileService: FileService,
    private _records: AssetsRecord = {}
  ) {
    const initalized = this._fileService.verifyRepository(this._path);

    if (!initalized) {
      throw new RepositoryError(`Repository ${_path} not initialized`);
    };
  }

  get assets() {
    return this._records;
  }

  /**
   * Returns the **Relative** path of the repository.
   */
  get Path() {
    return this._path;
  }

  /**
   * Returns the asset from the repository.
   * @param assetType - The type of asset to get.
   * @returns The asset from the repository.
   */
  getAsset(assetType: AssetType): QueueAsset {
    if (!this._records[assetType]) {
      throw new RepositoryError(`Asset type ${assetType} not found in repository`);
    }

    return this._records[assetType];
  };

  async createAsset(assetType: AssetType, filename: string) {
    const relativeDirPath = `/${assetType}`;

    await this._fileService.createPath(relativeDirPath);
    await this._fileService.createEmptyFile(relativeDirPath, filename);

    const relativeAssetPath = `${relativeDirPath}/${filename}`;

    this._records[assetType] = {
      path: relativeAssetPath,
    };

    return relativeAssetPath;
  };

  getAssetKeyByPath(path: string) {
    return Object
      .keys(this._records)
      .find(key => this._records[key as AssetType]!.path === path) as AssetType;
  }

  async removeAsset(assetType: AssetType) {
    this.checkAssetExists(assetType);
    this._fileService.deleteRepository(this._records[assetType]!.path);

    delete this._records[assetType];
  }

  async createAssetPath(assetType: AssetType) {
    const path = `/${assetType}`;

    await this._fileService.createPath(path);

    return path;
  }

  addAssetId(assetType: AssetType, assetId: string) {
    this.checkAssetExists(assetType);

    this._records[assetType]!.assetId = assetId;
  }

  addAssetETag(assetType: AssetType, eTag: string) {
    this.checkAssetExists(assetType);

    this._records[assetType]!.eTag = eTag;
  }

  checkAssetExists(assetType: AssetType) {
    if (!this._records[assetType]) {
      throw new RepositoryError(`Asset type ${assetType} not found in repository`);
    }

    return this._records[assetType];
  };

  async writeContent(relativePath: string, content: string) {
    await this._fileService.writeToEmptyFile(relativePath, content);
  }

  async readContent(assetType: AssetType) {
    this.checkAssetExists(assetType);

    const asset = this._records[assetType]!;

    const fileContents = await this._fileService.readFile(asset.path);

    if (!fileContents) {
      throw new RepositoryError(`File contents for asset type ${assetType} not found`);
    }

    if (typeof fileContents === 'string') {
      return fileContents;
    }

    return fileContents.toString('utf-8');
  };

  // removeAsset(assetType: AssetType) {}
  // insertToDb(assetType: AssetType) {}
  // uploadToR2(assetType: AssetType) {}
  // downloadFromR2(assetType: AssetType) {}
  // 
}
