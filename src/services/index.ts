export { supabase } from './supabaseClient';
export { signInAnonymously, getSession, getCurrentUserId, signOut, clearLocalCache } from './auth';
export type { AuthResult, SignOutResult } from './auth';
export { boot } from './boot';
export type { BootResult } from './boot';
export { createSneeze, listSneezes, updateSneezeAssessment } from './sneezes';
export type { CreateSneezeResult, ListSneezesResult, UpdateSneezeAssessmentResult } from './sneezes';
export { uploadSneezePhoto } from './storage';
export type { UploadSneezePhotoResult } from './storage';
