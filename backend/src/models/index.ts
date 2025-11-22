import { User } from './User';
import { Semester } from './Semester';
import { Student } from './Student';
import { StudentSemester } from './StudentSemester';
import { Teacher } from './Teacher';
import { TeacherAvailability } from './TeacherAvailability';
import { Topic } from './Topic';
import { TopicApplication } from './TopicApplication';
import { PreThesis } from './PreThesis';
import { ThesisProposal } from './ThesisProposal';
import { ThesisRegistration } from './ThesisRegistration';
import { Thesis } from './Thesis';
import { ThesisAssignment } from './ThesisAssignment';
import { DefenseSession } from './DefenseSession';
import { ThesisEvaluation } from './ThesisEvaluation';
import { ThesisFinalGrade } from './ThesisFinalGrade';
import { Announcement } from './Announcement';
import { Notification } from './Notification';
import { Attachment } from './Attachment';
import { Submission } from './Submission';

const models = {
    User,
    Semester,
    Student,
    StudentSemester,
    Teacher,
    TeacherAvailability,
    Topic,
    TopicApplication,
    PreThesis,
    ThesisRegistration,
    Thesis,
    ThesisAssignment,
    DefenseSession,
    ThesisEvaluation,
    ThesisFinalGrade,
    ThesisProposal,
    Announcement,
    Notification,
    Attachment,
    Submission,
};

let associationsApplied = false;

function applyAssociations() {
    if (associationsApplied) return;
    associationsApplied = true;

    // user -> student/teacher
    Student.belongsTo(User, { foreignKey: 'userId', as: 'user' });
    User.hasOne(Student, { foreignKey: 'userId', as: 'student' });

    Teacher.belongsTo(User, { foreignKey: 'userId', as: 'user' });
    User.hasOne(Teacher, { foreignKey: 'userId', as: 'teacher' });
    // student_semesters
    StudentSemester.belongsTo(Student, { foreignKey: 'studentId', as: 'student' });
    Student.hasMany(StudentSemester, { foreignKey: 'studentId', as: 'studentSemesters' });

    StudentSemester.belongsTo(Semester, { foreignKey: 'semesterId', as: 'semester' });
    Semester.hasMany(StudentSemester, { foreignKey: 'semesterId', as: 'studentSemesters' });

    // teacher_availability
    TeacherAvailability.belongsTo(Teacher, { foreignKey: 'teacherId', as: 'teacher' });
    Teacher.hasMany(TeacherAvailability, { foreignKey: 'teacherId', as: 'teacherAvailabilities' });

    TeacherAvailability.belongsTo(Semester, { foreignKey: 'semesterId', as: 'semester' });
    Semester.hasMany(TeacherAvailability, { foreignKey: 'semesterId', as: 'teacherAvailabilities' });

    // topics
    Topic.belongsTo(Teacher, { foreignKey: 'teacherId', as: 'teacher' });
    Teacher.hasMany(Topic, { foreignKey: 'teacherId', as: 'topics' });

    Topic.belongsTo(Semester, { foreignKey: 'semesterId', as: 'semester' });
    Semester.hasMany(Topic, { foreignKey: 'semesterId', as: 'topics' });

    TopicApplication.belongsTo(Topic, { foreignKey: 'topicId', as: 'topic' });
    Topic.hasMany(TopicApplication, { foreignKey: 'topicId', as: 'topicApplications' });

    TopicApplication.belongsTo(Student, { foreignKey: 'studentId', as: 'student' });
    Student.hasMany(TopicApplication, { foreignKey: 'studentId', as: 'topicApplications' });

    // pre_thesis_projects
    PreThesis.belongsTo(Student, { foreignKey: 'studentId', as: 'student' });
    Student.hasMany(PreThesis, { foreignKey: 'studentId', as: 'preTheses' });

    PreThesis.belongsTo(TopicApplication, { foreignKey: 'topicApplicationId', as: 'topicApplication' });
    TopicApplication.hasMany(PreThesis, { foreignKey: 'topicApplicationId', as: 'preTheses' });

    PreThesis.belongsTo(Semester, { foreignKey: 'semesterId', as: 'semester' });
    Semester.hasMany(PreThesis, { foreignKey: 'semesterId', as: 'preTheses' });

    PreThesis.belongsTo(Teacher, { foreignKey: 'supervisorTeacherId', as: 'supervisorTeacher' });
    Teacher.hasMany(PreThesis, { foreignKey: 'supervisorTeacherId', as: 'supervisions' });

    // thesis_proposals (student -> available teacher)
    ThesisProposal.belongsTo(Student, { foreignKey: 'studentId', as: 'student' });
    Student.hasMany(ThesisProposal, { foreignKey: 'studentId', as: 'thesisProposals' });

    ThesisProposal.belongsTo(Teacher, { foreignKey: 'targetTeacherId', as: 'targetTeacher' });
    Teacher.hasMany(ThesisProposal, { foreignKey: 'targetTeacherId', as: 'receivedProposals' });

    ThesisProposal.belongsTo(Semester, { foreignKey: 'semesterId', as: 'semester' });
    Semester.hasMany(ThesisProposal, { foreignKey: 'semesterId', as: 'thesisProposals' });

    // thesis_registrations
    ThesisRegistration.belongsTo(Student, { foreignKey: 'studentId', as: 'student' });
    Student.hasMany(ThesisRegistration, { foreignKey: 'studentId', as: 'thesisRegistrations' });

    ThesisRegistration.belongsTo(Teacher, { foreignKey: 'supervisorTeacherId', as: 'supervisorTeacher' });
    Teacher.hasMany(ThesisRegistration, { foreignKey: 'supervisorTeacherId', as: 'supervisedRegistrations' });
    
    ThesisRegistration.belongsTo(Semester, { foreignKey: 'semesterId', as: 'semester' });
    Semester.hasMany(ThesisRegistration, { foreignKey: 'semesterId', as: 'thesisRegistrations' });

    ThesisRegistration.belongsTo(Teacher, { foreignKey: 'submittedByTeacherId', as: 'submittedByTeacher' });
    Teacher.hasMany(ThesisRegistration, { foreignKey: 'submittedByTeacherId', as: 'submittedRegistrations' });

    ThesisRegistration.belongsTo(User, { foreignKey: 'approvedByUserId', as: 'approvedByUser' });
    User.hasMany(ThesisRegistration, { foreignKey: 'approvedByUserId', as: 'approvedRegistrations' });

    // theses
    Thesis.belongsTo(Student, { foreignKey: 'studentId', as: 'student' });
    Student.hasMany(Thesis, { foreignKey: 'studentId', as: 'theses' });

    Thesis.belongsTo(Teacher, { foreignKey: 'supervisorTeacherId', as: 'supervisorTeacher' });
    Teacher.hasMany(Thesis, { foreignKey: 'supervisorTeacherId', as: 'supervisedTheses' });

    Thesis.belongsTo(Semester, { foreignKey: 'semesterId', as: 'semester' });
    Semester.hasMany(Thesis, { foreignKey: 'semesterId', as: 'theses' });

    ThesisAssignment.belongsTo(Thesis, { foreignKey: 'thesisId', as: 'thesis' });
    Thesis.hasMany(ThesisAssignment, { foreignKey: 'thesisId', as: 'assignments' });

    ThesisAssignment.belongsTo(Teacher, { foreignKey: 'teacherId', as: 'teacher' });
    Teacher.hasMany(ThesisAssignment, { foreignKey: 'teacherId', as: 'assignments' });

    ThesisAssignment.belongsTo(User, { foreignKey: 'assignedByUserId', as: 'assignedByUser' });
    User.hasMany(ThesisAssignment, { foreignKey: 'assignedByUserId', as: 'assignmentsMade' });

    DefenseSession.belongsTo(Thesis, { foreignKey: 'thesisId', as: 'thesis' });
    Thesis.hasOne(DefenseSession, { foreignKey: 'thesisId', as: 'defenseSession' });

    ThesisEvaluation.belongsTo(Thesis, { foreignKey: 'thesisId', as: 'thesis' });
    Thesis.hasMany(ThesisEvaluation, { foreignKey: 'thesisId', as: 'evaluations' });

    ThesisEvaluation.belongsTo(Teacher, { foreignKey: 'evaluatorTeacherId', as: 'evaluatorTeacher' });
    Teacher.hasMany(ThesisEvaluation, { foreignKey: 'evaluatorTeacherId', as: 'evaluations' });

    ThesisFinalGrade.belongsTo(Thesis, { foreignKey: 'thesisId', as: 'thesis' });
    Thesis.hasOne(ThesisFinalGrade, { foreignKey: 'thesisId', as: 'finalGrade' });

    Announcement.belongsTo(User, { foreignKey: 'publishedByUserId', as: 'publishedBy' });
    User.hasMany(Announcement, { foreignKey: 'publishedByUserId', as: 'announcements' });

    Notification.belongsTo(User, { foreignKey: 'userId', as: 'user' });
    User.hasMany(Notification, { foreignKey: 'userId', as: 'notifications' });

    Attachment.belongsTo(User, { foreignKey: 'uploadedByUserId', as: 'uploadedBy' });
    User.hasMany(Attachment, { foreignKey: 'uploadedByUserId', as: 'attachments' });

    Submission.belongsTo(User, { foreignKey: 'uploadedByUserId', as: 'uploadedBy' });
    User.hasMany(Submission, { foreignKey: 'uploadedByUserId', as: 'submissions' });
}

export { applyAssociations, models };