interface BaseRepository<T, ID> {
  findById(id: ID): Promise<T | null>;
  findAll(filters?: any): Promise<T[]>;
  create(data: Partial<T>): Promise<T>;
  update(id: ID, data: Partial<T>): Promise<T | null>;
  delete(id: ID): Promise<boolean>;
  hardDelete?(id: ID): Promise<boolean>;
  restore?(id: ID): Promise<T | null>;
  findAllWithDeleted?(filters?: any): Promise<T[]>;
  findOnlyDeleted?(filters?: any): Promise<T[]>;
}

export { BaseRepository };