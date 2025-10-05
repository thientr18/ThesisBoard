import { User } from './User';
import { Role } from './Role';
import { UserRole } from './UserRole';
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
    Role,
    UserRole,
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

    // users <-> roles
    User.belongsToMany(Role, { through: UserRole, foreignKey: 'userId', otherKey: 'roleId' });
    Role.belongsToMany(User, { through: UserRole, foreignKey: 'roleId', otherKey: 'userId' });

    // user -> student/teacher
    Student.belongsTo(User, { foreignKey: 'userId' });
    User.hasOne(Student, { foreignKey: 'userId' });

    Teacher.belongsTo(User, { foreignKey: 'userId' });
    User.hasOne(Teacher, { foreignKey: 'userId' });

    // student_semesters
    StudentSemester.belongsTo(Student, { foreignKey: 'studentId' });
    Student.hasMany(StudentSemester, { foreignKey: 'studentId' });

    StudentSemester.belongsTo(Semester, { foreignKey: 'semesterId' });
    Semester.hasMany(StudentSemester, { foreignKey: 'semesterId' });

    // teacher_availability
    TeacherAvailability.belongsTo(Teacher, { foreignKey: 'teacherId' });
    Teacher.hasMany(TeacherAvailability, { foreignKey: 'teacherId' });

    TeacherAvailability.belongsTo(Semester, { foreignKey: 'semesterId' });
    Semester.hasMany(TeacherAvailability, { foreignKey: 'semesterId' });

    // topics
    Topic.belongsTo(Teacher, { foreignKey: 'teacherId' });
    Teacher.hasMany(Topic, { foreignKey: 'teacherId' });

    Topic.belongsTo(Semester, { foreignKey: 'semesterId' });
    Semester.hasMany(Topic, { foreignKey: 'semesterId' });

    TopicApplication.belongsTo(Topic, { foreignKey: 'topicId' });
    Topic.hasMany(TopicApplication, { foreignKey: 'topicId' });

    TopicApplication.belongsTo(Student, { foreignKey: 'studentId' });
    Student.hasMany(TopicApplication, { foreignKey: 'studentId' });

    // pre_thesis_projects
    PreThesis.belongsTo(Student, { foreignKey: 'studentId' });
    Student.hasMany(PreThesis, { foreignKey: 'studentId' });

    PreThesis.belongsTo(Topic, { foreignKey: 'topicId' });
    Topic.hasMany(PreThesis, { foreignKey: 'topicId' });

    PreThesis.belongsTo(Semester, { foreignKey: 'semesterId' });
    Semester.hasMany(PreThesis, { foreignKey: 'semesterId' });

    PreThesis.belongsTo(Teacher, { as: 'supervisorTeacher', foreignKey: 'supervisorTeacherId' });
    Teacher.hasMany(PreThesis, { as: 'supervisions', foreignKey: 'supervisorTeacherId' });

    // thesis_proposals (student -> available teacher)
    ThesisProposal.belongsTo(Student, { foreignKey: 'studentId' });
    Student.hasMany(ThesisProposal, { foreignKey: 'studentId' });

    ThesisProposal.belongsTo(Teacher, { as: 'targetTeacher', foreignKey: 'targetTeacherId' });
    Teacher.hasMany(ThesisProposal, { as: 'receivedProposals', foreignKey: 'targetTeacherId' });

    ThesisProposal.belongsTo(Semester, { foreignKey: 'semesterId' });
    Semester.hasMany(ThesisProposal, { foreignKey: 'semesterId' });

    // thesis_registrations
    ThesisRegistration.belongsTo(Student, { foreignKey: 'studentId' });
    Student.hasMany(ThesisRegistration, { foreignKey: 'studentId' });

    ThesisRegistration.belongsTo(Teacher, { as: 'supervisorTeacher', foreignKey: 'supervisorTeacherId' });
    Teacher.hasMany(ThesisRegistration, { as: 'supervisedRegistrations', foreignKey: 'supervisorTeacherId' });

    ThesisRegistration.belongsTo(Semester, { foreignKey: 'semesterId' });
    Semester.hasMany(ThesisRegistration, { foreignKey: 'semesterId' });

    ThesisRegistration.belongsTo(Teacher, { as: 'submittedByTeacher', foreignKey: 'submittedByTeacherId' });
    Teacher.hasMany(ThesisRegistration, { as: 'submittedRegistrations', foreignKey: 'submittedByTeacherId' });

    ThesisRegistration.belongsTo(User, { as: 'approvedByUser', foreignKey: 'approvedByUserId' });
    User.hasMany(ThesisRegistration, { as: 'approvedRegistrations', foreignKey: 'approvedByUserId' });

    // theses
    Thesis.belongsTo(Student, { foreignKey: 'studentId' });
    Student.hasMany(Thesis, { foreignKey: 'studentId' });

    Thesis.belongsTo(Teacher, { as: 'supervisorTeacher', foreignKey: 'supervisorTeacherId' });
    Teacher.hasMany(Thesis, { as: 'supervisedTheses', foreignKey: 'supervisorTeacherId' });

    Thesis.belongsTo(Semester, { foreignKey: 'semesterId' });
    Semester.hasMany(Thesis, { foreignKey: 'semesterId' });

    ThesisAssignment.belongsTo(Thesis, { foreignKey: 'thesisId' });
    Thesis.hasMany(ThesisAssignment, { foreignKey: 'thesisId' });

    ThesisAssignment.belongsTo(Teacher, { foreignKey: 'teacherId' });
    Teacher.hasMany(ThesisAssignment, { foreignKey: 'teacherId' });

    ThesisAssignment.belongsTo(User, { as: 'assignedByUser', foreignKey: 'assignedByUserId' });
    User.hasMany(ThesisAssignment, { as: 'assignmentsMade', foreignKey: 'assignedByUserId' });

    DefenseSession.belongsTo(Thesis, { foreignKey: 'thesisId' });
    Thesis.hasOne(DefenseSession, { foreignKey: 'thesisId' });

    ThesisEvaluation.belongsTo(Thesis, { foreignKey: 'thesisId' });
    Thesis.hasMany(ThesisEvaluation, { foreignKey: 'thesisId' });

    ThesisEvaluation.belongsTo(Teacher, { as: 'evaluatorTeacher', foreignKey: 'evaluatorTeacherId' });
    Teacher.hasMany(ThesisEvaluation, { as: 'evaluations', foreignKey: 'evaluatorTeacherId' });

    ThesisFinalGrade.belongsTo(Thesis, { foreignKey: 'thesisId' });
    Thesis.hasOne(ThesisFinalGrade, { foreignKey: 'thesisId' });

    // content/notifications/files
    Announcement.belongsTo(User, { as: 'publishedBy', foreignKey: 'publishedByUserId' });
    User.hasMany(Announcement, { as: 'announcements', foreignKey: 'publishedByUserId' });

    Notification.belongsTo(User, { foreignKey: 'userId' });
    User.hasMany(Notification, { foreignKey: 'userId' });

    Attachment.belongsTo(User, { as: 'uploadedBy', foreignKey: 'uploadedByUserId' });
    User.hasMany(Attachment, { as: 'attachments', foreignKey: 'uploadedByUserId' });

    Submission.belongsTo(User, { as: 'uploadedBy', foreignKey: 'uploadedByUserId' });
    User.hasMany(Submission, { as: 'submissions', foreignKey: 'uploadedByUserId' });
}

export { applyAssociations, models };