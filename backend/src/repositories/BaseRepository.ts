interface BaseRepository<T, ID> {
  findById(id: ID): Promise<T | null>;
  findAll(filters?: any): Promise<T[]>;
  create(data: Partial<T>, options?: any): Promise<T>;
  update(id: ID, data: Partial<T>, options?: any): Promise<T | null>;
  delete(id: ID, options?: any): Promise<boolean>;
  hardDelete?(id: ID, options?: any): Promise<boolean>;
  restore?(id: ID, options?: any): Promise<T | null>;
  findAllWithDeleted?(filters?: any): Promise<T[]>;
  findOnlyDeleted?(filters?: any): Promise<T[]>;
}

export { BaseRepository };