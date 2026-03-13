import { authRepository } from './repository';

export const buildSignInUrl = (redirectPath: string) =>
  `/signin.html?redirect=${encodeURIComponent(redirectPath)}`;

export const requireSignedIn = async (): Promise<boolean> => {
  const signedIn = await authRepository.isSignedIn();

  if (signedIn) {
    return true;
  }

  const redirectPath = `${window.location.pathname}${window.location.search}`;
  window.location.href = buildSignInUrl(redirectPath);
  return false;
};

export const getRedirectTarget = (): string => {
  const params = new URLSearchParams(window.location.search);
  return params.get('redirect') || '/';
};
