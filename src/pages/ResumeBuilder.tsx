import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, Save, FilePlus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { toPng } from 'html-to-image';

// Define types for resume data
interface Education {
  institution: string;
  degree: string;
  year: string;
}

interface Experience {
  company: string;
  position: string;
  duration: string;
  description: string;
}

interface Certification {
  name: string;
  issuer: string;
  year: string;
}

// Define the form schema
const resumeSchema = z.object({
  full_name: z.string().min(1, { message: 'Name is required' }),
  email: z.string().email({ message: 'Invalid email address' }),
  phone: z.string().optional(),
  objective: z.string().optional(),
  skills: z.array(z.string()).min(1, { message: 'At least one skill is required' }),
  education: z.array(
    z.object({
      institution: z.string().min(1, { message: 'Institution is required' }),
      degree: z.string().min(1, { message: 'Degree is required' }),
      year: z.string().min(1, { message: 'Year is required' })
    })
  ),
  experience: z.array(
    z.object({
      company: z.string().min(1, { message: 'Company name is required' }),
      position: z.string().min(1, { message: 'Position is required' }),
      duration: z.string().min(1, { message: 'Duration is required' }),
      description: z.string().optional()
    })
  ),
  certifications: z.array(
    z.object({
      name: z.string().min(1, { message: 'Certification name is required' }),
      issuer: z.string().min(1, { message: 'Issuer is required' }),
      year: z.string().min(1, { message: 'Year is required' })
    })
  ).optional()
});

type ResumeFormValues = z.infer<typeof resumeSchema>;

const ResumeBuilder = () => {
  const navigate = useNavigate();
  const [skillInput, setSkillInput] = useState('');
  const [isPending, setIsPending] = useState(false);
  const [resumeData, setResumeData] = useState<ResumeFormValues | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  
  // Initialize the form
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    watch
  } = useForm<ResumeFormValues>({
    resolver: zodResolver(resumeSchema),
    defaultValues: {
      full_name: '',
      email: '',
      phone: '',
      objective: '',
      skills: [],
      education: [{ institution: '', degree: '', year: '' }],
      experience: [{ company: '', position: '', duration: '', description: '' }],
      certifications: [{ name: '', issuer: '', year: '' }]
    }
  });
  
  const { fields: educationFields, append: appendEducation, remove: removeEducation } = useFieldArray({
    control,
    name: 'education'
  });
  
  const { fields: experienceFields, append: appendExperience, remove: removeExperience } = useFieldArray({
    control,
    name: 'experience'
  });
  
  const { fields: certificationFields, append: appendCertification, remove: removeCertification } = useFieldArray({
    control,
    name: 'certifications'
  });
  
  const skills = watch('skills');
  
  const addSkill = () => {
    if (skillInput && !skills.includes(skillInput)) {
      setValue('skills', [...skills, skillInput]);
      setSkillInput('');
    }
  };
  
  const removeSkill = (index: number) => {
    setValue(
      'skills',
      skills.filter((_, i) => i !== index)
    );
  };
  
  // Handle form submission
  const onSubmit = async (data: ResumeFormValues) => {
    try {
      setIsPending(true);
      
      // Convert nested objects to JSON strings for Supabase
      const resumeDataToInsert = {
        full_name: data.full_name,
        email: data.email,
        phone: data.phone || '',
        skills: data.skills,
        objective: data.objective || '',
        education: data.education as unknown as any,
        experience: data.experience as unknown as any,
        certifications: data.certifications as unknown as any
      };
      
      const { error } = await supabase
        .from('resumes')
        .insert(resumeDataToInsert);
      
      if (error) throw error;
      
      setResumeData(data);
      setShowPreview(true);

      toast({
        title: "Resume Created",
        description: "Your resume has been successfully created. You can now download it as an image.",
      });
      
      // Don't auto-navigate, show preview+download
    } catch (error: any) {
      console.error('Error saving resume:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save resume. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsPending(false);
    }
  };

  // Download resume as image logic
  const handleDownloadImage = async () => {
    const node = document.getElementById('resume-preview');
    if (!node) return;
    try {
      const dataUrl = await toPng(node, { cacheBust: true });
      const link = document.createElement('a');
      link.download = 'resume.png';
      link.href = dataUrl;
      link.click();
    } catch (err) {
      toast({
        title: "Failed to download",
        description: "Could not generate image from resume.",
        variant: "destructive",
      });
    }
  };

  // Print/preview-friendly resume display
  const ResumePreview = ({ data }: { data: ResumeFormValues }) => (
    <div
      id="resume-preview"
      className="bg-white rounded shadow max-w-2xl mx-auto p-8 text-gray-900"
      style={{ minWidth: 320, fontFamily: 'sans-serif' }}
    >
      <div className="text-center border-b pb-4 mb-4">
        <h1 className="text-3xl font-bold">{data.full_name}</h1>
        <div className="text-sm text-gray-600">{data.email} | {data.phone}</div>
        {data.objective && <div className="mt-3 text-base text-gray-700 italic">{data.objective}</div>}
      </div>
      <div>
        <h2 className="text-xl font-bold border-b mb-2">Skills</h2>
        <ul className="flex flex-wrap gap-2 mb-4">
          {data.skills.map((s, i) => (
            <li key={i} className="bg-purple-200 rounded px-2 py-1 text-sm">{s}</li>
          ))}
        </ul>
      </div>
      <div>
        <h2 className="text-xl font-bold border-b mb-2">Education</h2>
        {data.education.map((edu, i) => (
          <div key={i} className="mb-2">
            <div className="font-semibold">{edu.degree} - {edu.institution}</div>
            <div className="text-xs text-gray-600">{edu.year}</div>
          </div>
        ))}
      </div>
      <div>
        <h2 className="text-xl font-bold border-b mb-2">Work Experience</h2>
        {data.experience.map((exp, i) => (
          <div key={i} className="mb-2">
            <div className="font-semibold">{exp.position}, {exp.company}</div>
            <div className="text-xs text-gray-600">{exp.duration}</div>
            {exp.description && (
              <div className="mt-1 text-gray-700 text-sm">{exp.description}</div>
            )}
          </div>
        ))}
      </div>
      {data.certifications && data.certifications.length > 0 && (
        <div>
          <h2 className="text-xl font-bold border-b mb-2">Certifications</h2>
          {data.certifications.map((c, i) => (
            <div key={i} className="mb-2">
              <div className="font-semibold">{c.name} - {c.issuer}</div>
              <div className="text-xs text-gray-600">{c.year}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <DashboardLayout>
      <div className="container mx-auto py-6 max-w-4xl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Resume Builder</h1>
          <Button variant="outline" onClick={() => navigate('/dashboard')}>
            Back to Dashboard
          </Button>
        </div>
        {showPreview && resumeData ? (
          <div>
            <div className="mb-6">
              <ResumePreview data={resumeData} />
            </div>
            <div className="flex gap-4 flex-wrap">
              <Button onClick={handleDownloadImage} className="bg-purple-700 hover:bg-purple-800 text-white">
                Download as Image
              </Button>
              <Button variant="outline" onClick={() => { setShowPreview(false); setResumeData(null); }}>
                Edit Resume
              </Button>
              <Button variant="outline" onClick={() => navigate('/dashboard')}>
                Done
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>
                  Enter your basic information to get started.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input id="fullName" {...register('full_name')} />
                    {errors.full_name && (
                      <p className="text-sm text-red-500">{errors.full_name.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" {...register('email')} />
                    {errors.email && (
                      <p className="text-sm text-red-500">{errors.email.message}</p>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone (Optional)</Label>
                    <Input id="phone" {...register('phone')} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="objective">Career Objective (Optional)</Label>
                  <Textarea id="objective" {...register('objective')} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Skills</CardTitle>
                <CardDescription>
                  Add your key skills and competencies.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex space-x-2">
                    <Input
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      placeholder="Enter a skill (e.g. JavaScript, Project Management)"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addSkill();
                        }
                      }}
                    />
                    <Button type="button" onClick={addSkill}>
                      Add
                    </Button>
                  </div>

                  {errors.skills && (
                    <p className="text-sm text-red-500">{errors.skills.message}</p>
                  )}

                  <div className="flex flex-wrap gap-2 mt-2">
                    {skills.map((skill, index) => (
                      <div
                        key={index}
                        className="bg-purple-100 px-3 py-1 rounded-full flex items-center gap-2"
                      >
                        <span>{skill}</span>
                        <button
                          type="button"
                          onClick={() => removeSkill(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Education</CardTitle>
                <CardDescription>
                  Add your educational background.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {educationFields.map((field, index) => (
                    <div key={field.id} className="space-y-4">
                      {index > 0 && <Separator className="my-4" />}
                      <div className="flex justify-between items-center">
                        <h4 className="font-medium">Education #{index + 1}</h4>
                        {index > 0 && (
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={() => removeEducation(index)}
                          >
                            <Trash2 size={16} /> Remove
                          </Button>
                        )}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor={`education.${index}.institution`}>Institution</Label>
                          <Input
                            id={`education.${index}.institution`}
                            {...register(`education.${index}.institution`)}
                          />
                          {errors.education?.[index]?.institution && (
                            <p className="text-sm text-red-500">
                              {errors.education[index].institution?.message}
                            </p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`education.${index}.degree`}>Degree/Certificate</Label>
                          <Input
                            id={`education.${index}.degree`}
                            {...register(`education.${index}.degree`)}
                          />
                          {errors.education?.[index]?.degree && (
                            <p className="text-sm text-red-500">
                              {errors.education[index].degree?.message}
                            </p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`education.${index}.year`}>Year</Label>
                          <Input id={`education.${index}.year`} {...register(`education.${index}.year`)} />
                          {errors.education?.[index]?.year && (
                            <p className="text-sm text-red-500">
                              {errors.education[index].year?.message}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full mt-2"
                    onClick={() => appendEducation({ institution: '', degree: '', year: '' })}
                  >
                    <Plus size={16} className="mr-2" /> Add Another Education
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Work Experience</CardTitle>
                <CardDescription>
                  Add your professional experience.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {experienceFields.map((field, index) => (
                    <div key={field.id} className="space-y-4">
                      {index > 0 && <Separator className="my-4" />}
                      <div className="flex justify-between items-center">
                        <h4 className="font-medium">Experience #{index + 1}</h4>
                        {index > 0 && (
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={() => removeExperience(index)}
                          >
                            <Trash2 size={16} /> Remove
                          </Button>
                        )}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor={`experience.${index}.company`}>Company</Label>
                          <Input
                            id={`experience.${index}.company`}
                            {...register(`experience.${index}.company`)}
                          />
                          {errors.experience?.[index]?.company && (
                            <p className="text-sm text-red-500">
                              {errors.experience[index].company?.message}
                            </p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`experience.${index}.position`}>Position</Label>
                          <Input
                            id={`experience.${index}.position`}
                            {...register(`experience.${index}.position`)}
                          />
                          {errors.experience?.[index]?.position && (
                            <p className="text-sm text-red-500">
                              {errors.experience[index].position?.message}
                            </p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`experience.${index}.duration`}>Duration</Label>
                          <Input
                            id={`experience.${index}.duration`}
                            placeholder="e.g. 2018 - 2022"
                            {...register(`experience.${index}.duration`)}
                          />
                          {errors.experience?.[index]?.duration && (
                            <p className="text-sm text-red-500">
                              {errors.experience[index].duration?.message}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`experience.${index}.description`}>Description</Label>
                        <Textarea
                          id={`experience.${index}.description`}
                          {...register(`experience.${index}.description`)}
                        />
                      </div>
                    </div>
                  ))}

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full mt-2"
                    onClick={() =>
                      appendExperience({ company: '', position: '', duration: '', description: '' })
                    }
                  >
                    <Plus size={16} className="mr-2" /> Add Another Experience
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Certifications (Optional)</CardTitle>
                <CardDescription>
                  Add any professional certifications you've earned.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {certificationFields.map((field, index) => (
                    <div key={field.id} className="space-y-4">
                      {index > 0 && <Separator className="my-4" />}
                      <div className="flex justify-between items-center">
                        <h4 className="font-medium">Certification #{index + 1}</h4>
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => removeCertification(index)}
                        >
                          <Trash2 size={16} /> Remove
                        </Button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor={`certifications.${index}.name`}>Name</Label>
                          <Input
                            id={`certifications.${index}.name`}
                            {...register(`certifications.${index}.name`)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`certifications.${index}.issuer`}>Issuer</Label>
                          <Input
                            id={`certifications.${index}.issuer`}
                            {...register(`certifications.${index}.issuer`)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`certifications.${index}.year`}>Year</Label>
                          <Input
                            id={`certifications.${index}.year`}
                            {...register(`certifications.${index}.year`)}
                          />
                        </div>
                      </div>
                    </div>
                  ))}

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full mt-2"
                    onClick={() => appendCertification({ name: '', issuer: '', year: '' })}
                  >
                    <Plus size={16} className="mr-2" /> Add Certification
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end space-x-4">
              <Button type="button" variant="outline" onClick={() => navigate('/dashboard')}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPending} className="bg-purple-700 hover:bg-purple-800">
                {isPending ? 'Saving...' : 'Save Resume'}
                {!isPending && <Save size={16} className="ml-2" />}
              </Button>
            </div>
          </form>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ResumeBuilder;
