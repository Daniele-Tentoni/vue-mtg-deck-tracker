import md5 from 'blueimp-md5';

export function useGravatar(
  email: string | undefined,
  size: number = 80,
): {
  avatarUrl: string;
  profileUrl: string;
} {
  if (!email) {
    return {
      avatarUrl: '',
      profileUrl: '',
    };
  }

  const hash = md5(email.trim().toLowerCase());
  return {
    avatarUrl: `https://www.gravatar.com/avatar/${hash}?s=${size}&d=monsterid`,
    profileUrl: `https://www.gravatar.com/${hash}`,
  };
}
