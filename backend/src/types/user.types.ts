export interface StudentDetails {
  id: number;
  userId: number;
  studentId: string;
  cohortYear: number | null;
  className: string | null;
  phone: string | null;
  dob: Date | null;
  gender: 'male' | 'female' | 'other' | null;
  status: 'active' | 'inactive' | 'graduated';
}

export interface TeacherDetails {
  id: number;
  userId: number;
  teacherCode: string | null;
  title: string | null;
  office: string | null;
  phone: string | null;
  email: string | null;
}