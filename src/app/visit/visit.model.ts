import { User } from './user.model'
import { Student } from '../students/student.model'

export interface Visit {
  id: number;
  date: string;
  note: string;
  user: User;
  students: Student[];
}
