import { off } from "process";

export interface StudentInfo {
  name: string;
  id: string;
  phone: string;
  className: string;
  cohortYear?: number;
  gpa?: number;
  accumulatedCredits?: number;
  preThesisTitle: string;
}

export interface SupervisorInfo {
  name: string;
  academicTitle: string;
  office: string;
}

export interface EvaluationInfo {
  numericGrade: number;
  letterGrade: string;
  comments: string;
  status: 'Pass' | 'Fail' | 'Not Graded' | undefined | null;
}

export interface PreThesisReportData {
  student: StudentInfo;
  supervisor: SupervisorInfo;
  evaluation: EvaluationInfo;
  semester: string;
  date: Date;
  universityInfo: {
    name: string;
    address: string;
    contact: string;
  };
  departmentHead: {
    name: string;
    title: string;
  };
}

export interface ThesisRegistrationReportData {
  university: {
    name: string;
    logo?: string;
  };
  document: {
    title: string;
    semester: string;
    department: string;
    generatedAt: Date;
  };
  student: {
    fullName: string;
    id: string;
    major: string;
    faculty: string;
    gpa: number;
    accumulatedCredits: number;
  };
  thesis: {
    title: string;
    type: string;
    abstract: string;
    keywords: string[];
  };
  supervisor: {
    fullName: string;
    academicTitle: string;
    department: string;
    email: string;
  };
  registration: {
    date: Date;
    status: 'pending_approval' | 'approved' | 'rejected';
    notes?: string;
  };
  footer: {
    universityContactInfo: string;
    websiteUrl: string;
  };
}

export interface ThesisEvaluationReportData {
  university: {
    name: string;
    logo: string; // Base64 encoded image
    referenceNumber?: string;
  };
  document: {
    title: string;
    semester: string;
    department: string;
    generatedAt: Date;
  };
  student: {
    fullName: string;
    id: string;
    major: string;
    faculty: string;
    gpa: number;
    accumulatedCredits: number;
  };
  thesis: {
    title: string;
    type: string;
    abstract: string;
    defenseDate?: Date;
  };
  supervisor: {
    fullName: string;
    academicTitle: string;
    department: string;
    email: string;
    comments?: string;
    grade?: number;
  };
  reviewer: {
    fullName: string;
    academicTitle: string;
    department: string;
    email: string;
    comments: string;
    grade: number;
  };
  committee: Array<{
    fullName: string;
    role: string;
    department: string;
    grade: number;
    comments?: string;
  }>;
  evaluation: {
    averageGrade: number;
    letterGrade: string;
    status: 'Pass' | 'Fail';
    remarks?: string;
  };
  signatures: {
    supervisorName: string;
    committeeName: string;
    departmentHeadName: string;
    date: Date;
  };
  footer: {
    universityContactInfo: string;
    websiteUrl: string;
  };
}