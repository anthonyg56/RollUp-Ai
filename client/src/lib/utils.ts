import type { ApiType } from "@server/types";
import { hc } from "hono/client";
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { redirect } from "@tanstack/react-router";

import authClient from "@/lib/authClient";
import { PUBLIC_ROUTES, AUTH_ROUTES, PROTECTED_ROUTES, PublicRoute, AuthRoute, ProtectedRoute } from "./constants";

const { getSession } = authClient

export const api = hc<ApiType>("/api");

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function capitalizeFirstLetter(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function extractInitals(input: string | null): string {
  if (!input) return 'NA';
  return input.split(' ').map(word => word[0]).join('');
};

export const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const getFileName = (file: File): string => {
  let filename = file.name.split(".")[0];

  if (filename.length > 20) {
    filename = filename.slice(0, 20) + "...";
  }

  filename = filename.replace(/_/g, " ");
  filename = filename.replace(/-/g, " ");

  return filename;
};

export function matchRoutesType(pathname: string, type: "Public" | "Auth" | "Protected") {
  if (type === "Public") {
    return PUBLIC_ROUTES.includes(pathname as PublicRoute);
  } else if (type === "Auth") {
    return AUTH_ROUTES.includes(pathname as AuthRoute);
  } else if (type === "Protected") {
    return PROTECTED_ROUTES.includes(pathname as ProtectedRoute);
  } else {
    return false;
  }
};

// Helper function to poll for asset ready status
// export async function pollForAssetReady(uploadId: string): Promise<void> {
//   return new Promise((resolve, reject) => {
//     const checkStatus = async () => {
//       try {
//         const response = await fetch(`/api/check-upload-status?uploadId=${uploadId}`);

//         if (!response.ok) {
//           throw new Error('Failed to check status');
//         }

//         const { status } = await response.json();

//         if (status === 'ready') {
//           resolve();
//         } else if (status === 'errored') {
//           reject(new Error('Processing failed'));
//         } else {
//           // Still processing, check again after delay
//           setTimeout(checkStatus, 2000);
//         }
//       } catch (err) {
//         reject(err);
//       }
//     };

//     checkStatus();
//   });
// }

// function makeQueryClient() {
//   return new QueryClient({
//     defaultOptions: {
//       queries: {
//         staleTime: 1000 * 60,
//       },
//     },
//   });
// };

// let browserQueryClient: QueryClient | null = null;

// export function getQueryClient() {
//   if (isServer) {
//     return makeQueryClient();
//   } else {
//     if (!browserQueryClient) {
//       browserQueryClient = makeQueryClient();
//     }

//     return browserQueryClient;
//   }
// }

// Auth
export const checkSession = async () => {
  const session = await getSession()

  if (!session.data || session.error) {
    throw redirect({
      to: '/login',
    })
  }
}

// Handles redirecting to the correct page based on the session data
export const handleSessionRedirect = async () => {
  const session = await getSession()

  if (session.data && session.data.user) {
    if (session.data.user.emailVerified === false) {
      throw redirect({ to: '/verify' })
    } else {
      throw redirect({ to: '/videos' })
    }
  }
}