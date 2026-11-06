const PASSWORD_LENGTH = { max: 128, min: 12 } as const;

const USERNAME_LENGTH = { max: 30, min: 3 } as const;

export { PASSWORD_LENGTH, USERNAME_LENGTH };
