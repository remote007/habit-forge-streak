/**
 * Utility functions for transforming data between backend and frontend formats
 */

/**
 * Transform MongoDB's _id field to id for frontend consistency
 * @param data Object or array of objects with _id field from MongoDB
 * @returns Same data with id field added (keeping _id for compatibility)
 */
export const transformMongoId = <T extends Record<string, any>>(data: T): T & { id: string } => {
  if (!data) return data as any;
  
  return {
    ...data,
    id: data._id
  };
};

/**
 * Transform an array of MongoDB objects with _id to objects with id
 * @param dataArray Array of objects with _id field from MongoDB
 * @returns Same array with id field added to each object
 */
export const transformMongoIds = <T extends Record<string, any>>(dataArray: T[]): (T & { id: string })[] => {
  if (!dataArray || !Array.isArray(dataArray)) return [] as any;
  
  return dataArray.map(item => transformMongoId(item));
};
