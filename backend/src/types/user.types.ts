export interface StudentDetails {
  id: number;
  userId: number;
  studentIdCode: string;
  email: string | null;
  fullName: string | null;
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
  email: string | null;
  fullName: string | null;
  teacherCode: string | null;
  title: string | null;
  office: string | null;
  phone: string | null;
}