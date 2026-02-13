import * as z from "zod";

const userSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  username: z.string().optional(),
  displayName: z.string().optional(),
});

export { userSchema };
