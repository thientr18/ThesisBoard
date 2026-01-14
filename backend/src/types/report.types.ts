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
  student: {
    name: string;
    id: string;
    phone: string;
    className: string;
    preThesisTitle: string;
  };
  supervisor: {
    name: string;
    academicTitle: string;
    office: string;
  };
  evaluation: {
    numericGrade: number;
    letterGrade: string;
    comments: string;
    status: string;
  };
  departmentHead: {
    name: string;
    title: string;
  };
  semester: string;
  date: Date;
  universityInfo: {
    name: string;
    address: string;
    contact: string;
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
  student: {
    name: string;
    id: string;
    phone: string;
    className: string;
    thesisTitle: string;
  };
  supervisor: {
    name: string;
    academicTitle: string;
    grade: number;
    comments: string;
  };
  reviewer?: {
    name: string;
    academicTitle: string;
    grade: number;
    comments: string;
  };
  committee: Array<{
    fullName: string;
    academicTitle: string;
    grade: number;
    comments: string;
  }>;
  evaluation: {
    averageGrade: number;
    letterGrade: string;
    status: string;
    defenseDate?: Date;
  };
  departmentHead: {
    name: string;
    title: string;
  };
  semester: string;
  date: Date;
  universityInfo: {
    name: string;
    address: string;
    contact: string;
  };
}