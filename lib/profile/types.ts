export type ProfileActionState = {
  error: string | null;
  message: string | null;
};

export const initialProfileActionState: ProfileActionState = {
  error: null,
  message: null,
};
