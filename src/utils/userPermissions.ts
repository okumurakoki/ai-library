// ユーザー権限管理

export type UserRole = 'guest' | 'free' | 'premium' | 'admin';

export interface UserPermissions {
  canViewAllPrompts: boolean;
  canCopyPrompts: boolean;
  canViewArticles: boolean;
  canViewStatistics: boolean;
  canCreateCustomPrompts: boolean;
  canSaveFavorites: boolean;
  canExportImport: boolean;
  canUseFolders: boolean;
  maxVisiblePrompts: number | null; // null = 無制限
  maxCustomPrompts: number | null; // null = 無制限
  maxFavorites: number | null; // null = 無制限
  isAdmin: boolean;
}

export const getUserRole = (user: any): UserRole => {
  if (!user) return 'guest';
  if (user.publicMetadata?.isAdmin === true) return 'admin';
  if (user.publicMetadata?.plan === 'premium') return 'premium';
  return 'free';
};

export const getUserPermissions = (user: any): UserPermissions => {
  const role = getUserRole(user);

  switch (role) {
    case 'admin':
      return {
        canViewAllPrompts: true,
        canCopyPrompts: true,
        canViewArticles: true,
        canViewStatistics: true,
        canCreateCustomPrompts: true,
        canSaveFavorites: true,
        canExportImport: true,
        canUseFolders: true,
        maxVisiblePrompts: null,
        maxCustomPrompts: null,
        maxFavorites: null,
        isAdmin: true,
      };

    case 'premium':
      return {
        canViewAllPrompts: true,
        canCopyPrompts: true,
        canViewArticles: true,
        canViewStatistics: true,
        canCreateCustomPrompts: true,
        canSaveFavorites: true,
        canExportImport: true,
        canUseFolders: true,
        maxVisiblePrompts: null,
        maxCustomPrompts: null,
        maxFavorites: null,
        isAdmin: false,
      };

    case 'free':
      return {
        canViewAllPrompts: false,
        canCopyPrompts: true,
        canViewArticles: false,
        canViewStatistics: false,
        canCreateCustomPrompts: true,
        canSaveFavorites: true,
        canExportImport: true,
        canUseFolders: false,
        maxVisiblePrompts: 20,
        maxCustomPrompts: 10,
        maxFavorites: 50,
        isAdmin: false,
      };

    case 'guest':
      return {
        canViewAllPrompts: false,
        canCopyPrompts: false,
        canViewArticles: false,
        canViewStatistics: false,
        canCreateCustomPrompts: false,
        canSaveFavorites: false,
        canExportImport: false,
        canUseFolders: false,
        maxVisiblePrompts: 20,
        maxCustomPrompts: 0,
        maxFavorites: 0,
        isAdmin: false,
      };

    default:
      return {
        canViewAllPrompts: false,
        canCopyPrompts: false,
        canViewArticles: false,
        canViewStatistics: false,
        canCreateCustomPrompts: false,
        canSaveFavorites: false,
        canExportImport: false,
        canUseFolders: false,
        maxVisiblePrompts: 20,
        maxCustomPrompts: 0,
        maxFavorites: 0,
        isAdmin: false,
      };
  }
};
