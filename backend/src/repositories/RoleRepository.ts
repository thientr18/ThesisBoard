import { GenericRepository } from './GenericRepository';
import { Role } from '../models/Role';

export class RoleRepository extends GenericRepository<Role, number> {
  constructor() {
    super(Role);
  }
}