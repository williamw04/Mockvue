import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TopNavBar } from './TopNavBar';
import { useUser } from '../services';
import type { UserProfile, Resume, CandidateProfile } from '../types';
import { Upload, Loader2 } from 'lucide-react';

function formatDate(dateString?: string): string {
    if (!dateString) return '';
    try {
        const [year, month] = dateString.split('-');
        if (!year || !month) return dateString;
        const date = new Date(parseInt(year), parseInt(month) - 1);
        return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    } catch {
        return dateString;
    }
}

export default function ProfilePage() {
    const userService = useUser();
    const navigate = useNavigate();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [resume, setResume] = useState<Resume | null>(null);
    const [candidateProfile, setCandidateProfile] = useState<CandidateProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [replacingResume, setReplacingResume] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [p, r, cp] = await Promise.all([
                userService.getUserProfile(),
                userService.getResume(),
                userService.getCandidateProfile(),
            ]);
            setProfile(p);
            setResume(r);
            setCandidateProfile(cp);
        } catch (error) {
            console.error('Error loading profile data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenPdf = () => {
        if (resume?.resumePdfPath && window.electronAPI) {
            window.electronAPI.openResumePdf(resume.resumePdfPath);
        }
    };

    const handleReplaceResume = async () => {
        if (!window.electronAPI) return;
        
        const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
        if (!apiKey) {
            alert('API key not configured. Please add VITE_GEMINI_API_KEY to your .env file.');
            return;
        }
        
        const result = await window.electronAPI.showOpenDialog({
            filters: [{ name: 'PDF', extensions: ['pdf'] }],
        });

        if (!result.canceled && result.filePath) {
            setReplacingResume(true);
            try {
                // Copy the new PDF to app storage and get the stored path
                const copyResult = await window.electronAPI.replaceResumePdf(result.filePath);
                
                if (copyResult.success && copyResult.pdfPath) {
                    // Parse the new PDF to extract resume details
                    const parseResult = await window.electronAPI.parseResume(copyResult.pdfPath, apiKey);
                    
                    if (parseResult.success && parseResult.data) {
                        const parsedData = parseResult.data;
                        
                        // Build updated resume with parsed data
                        const updatedResumeData = {
                            ...resume,
                            resumePdfPath: copyResult.pdfPath,
                            rawText: parseResult.rawText,
                            workExperiences: parsedData.workExperience?.map((exp: any) => ({
                                id: crypto.randomUUID(),
                                company: exp.company || '',
                                position: exp.position || '',
                                startDate: exp.startDate || '',
                                endDate: exp.endDate || '',
                                description: exp.description || '',
                                achievements: exp.achievements || [],
                            })) || [],
                            education: parsedData.education?.map((edu: any) => ({
                                id: crypto.randomUUID(),
                                school: edu.school || '',
                                degree: edu.degree || '',
                                field: edu.field || '',
                                startDate: edu.startDate || '',
                                endDate: edu.endDate || '',
                            })) || [],
                            skills: parsedData.skills || [],
                            projects: parsedData.projects?.map((proj: any) => ({
                                id: crypto.randomUUID(),
                                title: proj.title || '',
                                description: proj.description || '',
                                role: proj.role || '',
                                technologies: proj.technologies || [],
                                url: proj.url || '',
                            })) || [],
                            summary: parsedData.summary || '',
                            coreStoryMatches: parsedData.coreStoryMatches || [],
                        };
                        
                        const updatedResume = await userService.saveResume(updatedResumeData);
                        setResume(updatedResume);
                    } else {
                        // If parsing fails, just update the PDF path
                        const updatedResume = await userService.saveResume({
                            ...resume,
                            resumePdfPath: copyResult.pdfPath,
                        });
                        setResume(updatedResume);
                    }
                } else {
                    throw new Error(copyResult.error || 'Failed to replace resume');
                }
            } catch (error) {
                console.error('Error replacing resume:', error);
            } finally {
                setReplacingResume(false);
            }
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100">
                <TopNavBar />
                <div className="flex h-[calc(100vh-80px)] items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100">
            <TopNavBar />

            <div className="container mx-auto p-6 max-w-4xl pt-20">
                {/* Profile header */}
                {profile && (
                    <div className="rounded-2xl p-8 bg-surface shadow-lg mb-8">
                        <div className="flex items-center gap-6">
                            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
                                {profile.name?.[0]?.toUpperCase() || 'U'}
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">{profile.name}</h1>
                                {profile.targetRole && (
                                    <p className="text-gray-600 mt-1">
                                        {profile.targetRole}
                                        {profile.targetCompany && ` at ${profile.targetCompany}`}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* No resume data */}
                {!resume && (
                    <div className="rounded-2xl p-12 bg-surface shadow-lg text-center">
                        <div className="text-5xl mb-4">📄</div>
                        <h2 className="text-xl font-semibold text-gray-900 mb-2">No Resume Data Yet</h2>
                        <p className="text-gray-500">
                            Complete the onboarding flow to add your resume information.
                        </p>
                    </div>
                )}

                {resume && (
                    <>
                        {/* Uploaded Resume PDF + Resume Score */}
                        {resume.resumePdfPath && (
                            <div className="rounded-2xl p-6 bg-surface shadow-lg mb-8">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-lg bg-red-50 flex items-center justify-center">
                                            <span className="text-2xl">📕</span>
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-900">Uploaded Resume</h3>
                                            <p className="text-sm text-gray-500">
                                                PDF saved on {resume.updatedAt ? new Date(resume.updatedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'unknown date'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        {/* Resume Score */}
                                        {candidateProfile && (
                                            <div className={`px-3 py-1.5 rounded-full text-sm font-bold border ${candidateProfile.resumeScore >= 80
                                                    ? 'text-green-600 bg-green-50 border-green-200'
                                                    : candidateProfile.resumeScore >= 60
                                                        ? 'text-amber-600 bg-amber-50 border-amber-200'
                                                        : 'text-red-600 bg-red-50 border-red-200'
                                                }`}>
                                                Score: {candidateProfile.resumeScore}/100
                                            </div>
                                        )}
                                        <button
                                            onClick={() => navigate('/resume-review')}
                                            className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium rounded-lg transition-all text-sm"
                                        >
                                            ⚡ Analyze Resume
                                        </button>
                                        <button
                                            onClick={handleOpenPdf}
                                            className="px-5 py-2.5 border border-gray-200 bg-surface hover:bg-gray-50 text-gray-700 font-medium rounded-lg transition-colors text-sm"
                                        >
                                            📂 Open PDF
                                        </button>
                                        <button
                                            onClick={handleReplaceResume}
                                            disabled={replacingResume}
                                            className="px-5 py-2.5 border border-gray-200 bg-surface hover:bg-gray-50 text-gray-700 font-medium rounded-lg transition-colors text-sm disabled:opacity-50"
                                        >
                                            {replacingResume ? (
                                                <>
                                                    <Loader2 className="w-4 h-4 mr-2 inline animate-spin" />
                                                    Replacing...
                                                </>
                                            ) : (
                                                <>
                                                    <Upload className="w-4 h-4 mr-2 inline" />
                                                    Replace Resume
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Work Experience */}
                        {resume.workExperiences && resume.workExperiences.length > 0 && (
                            <div className="rounded-2xl p-8 bg-surface shadow-lg mb-8">
                                <h2 className="text-xl font-bold text-gray-900 mb-6">💼 Work Experience</h2>
                                <div className="space-y-6">
                                    {resume.workExperiences.map((exp, i) => (
                                        <div
                                            key={i}
                                            className="relative pl-6 border-l-2 border-blue-200 pb-2"
                                        >
                                            <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-blue-600 border-2 border-white" />
                                            <div className="flex items-start justify-between mb-1">
                                                <div>
                                                    <h3 className="text-lg font-semibold text-gray-900">{exp.position}</h3>
                                                    <p className="text-blue-600 font-medium">{exp.company}</p>
                                                </div>
                                                <span className="text-sm text-gray-400 whitespace-nowrap ml-4">
                                                    {exp.startDate ? formatDate(exp.startDate) : '?'} — {exp.endDate ? formatDate(exp.endDate) : 'Present'}
                                                </span>
                                            </div>
                                            {exp.achievements && exp.achievements.length > 0 && (
                                                <ul className="mt-3 space-y-1.5">
                                                    {exp.achievements.map((ach, j) => (
                                                        <li key={j} className="flex items-start gap-2 text-sm text-gray-700">
                                                            <span className="text-blue-500 mt-0.5 flex-shrink-0">•</span>
                                                            <span>{ach}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Education */}
                        {resume.education && resume.education.length > 0 && (
                            <div className="rounded-2xl p-8 bg-surface shadow-lg mb-8">
                                <h2 className="text-xl font-bold text-gray-900 mb-6">🎓 Education</h2>
                                <div className="space-y-4">
                                    {resume.education.map((edu, i) => (
                                        <div key={i} className="flex items-start justify-between p-4 bg-gray-50 rounded-lg">
                                            <div>
                                                <h3 className="font-semibold text-gray-900">{edu.school}</h3>
                                                <p className="text-sm text-gray-600">
                                                    {edu.degree} {edu.field ? `in ${edu.field}` : ''}
                                                </p>
                                                {edu.gpa && <p className="text-xs text-gray-500 mt-1">GPA: {edu.gpa}</p>}
                                            </div>
                                            <span className="text-sm text-gray-400 whitespace-nowrap ml-4">
                                                {edu.startDate ? formatDate(edu.startDate) : '?'} — {edu.endDate ? formatDate(edu.endDate) : 'Present'}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Projects */}
                        {resume.projects && resume.projects.length > 0 && (
                            <div className="rounded-2xl p-8 bg-surface shadow-lg mb-8">
                                <h2 className="text-xl font-bold text-gray-900 mb-6">🚀 Projects</h2>
                                <div className="space-y-4">
                                    {resume.projects.map((proj, i) => (
                                        <div key={i} className="p-5 bg-gray-50 rounded-lg">
                                            <div className="flex items-start justify-between mb-2">
                                                <h3 className="font-semibold text-gray-900">{proj.title}</h3>
                                                {proj.url && (
                                                    <a
                                                        href={proj.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-sm text-blue-600 hover:underline"
                                                    >
                                                        🔗 Link
                                                    </a>
                                                )}
                                            </div>
                                            {proj.role && (
                                                <p className="text-sm text-blue-600 font-medium mb-1">{proj.role}</p>
                                            )}
                                            {proj.description && (
                                                <p className="text-sm text-gray-600 mb-3">{proj.description}</p>
                                            )}
                                            {proj.technologies && proj.technologies.length > 0 && (
                                                <div className="flex flex-wrap gap-1.5">
                                                    {proj.technologies.map((tech, j) => (
                                                        <span
                                                            key={j}
                                                            className="px-2 py-0.5 bg-gray-200 text-gray-700 text-xs rounded-md font-medium"
                                                        >
                                                            {tech}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Skills — at the bottom */}
                        {resume.skills && resume.skills.length > 0 && (
                            <div className="rounded-2xl p-8 bg-surface shadow-lg mb-8">
                                <h2 className="text-xl font-bold text-gray-900 mb-4">🛠️ Skills</h2>
                                <div className="flex flex-wrap gap-2">
                                    {resume.skills.map((skill, i) => (
                                        <span
                                            key={i}
                                            className="px-3 py-1.5 bg-blue-50 text-blue-700 text-sm font-medium rounded-full border border-blue-200"
                                        >
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
