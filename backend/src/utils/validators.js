import mongoose from 'mongoose';

export const oid = (id) => mongoose.Types.ObjectId.isValid(id);
