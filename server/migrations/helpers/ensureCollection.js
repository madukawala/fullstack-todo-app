// Creates a collection with a validator, or applies the validator if the
// collection already exists (for example if it was created by hand in Compass).
export async function ensureCollection(db, name, validator) {
  const [existing] = await db.listCollections({ name }).toArray();

  if (existing) {
    await db.command({ collMod: name, validator });
  } else {
    await db.createCollection(name, { validator });
  }
}
