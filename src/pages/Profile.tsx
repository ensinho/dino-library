import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  User, 
  Mail, 
  Trophy, 
  Calendar, 
  BookOpen, 
  Edit3, 
  Save, 
  X,
  Settings,
  Award,
  TrendingUp
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';
import type { Database } from '@/integrations/supabase/types';

type Profile = Database['public']['Tables']['profiles']['Row'] & {
  quiz_scores?: {
    latest_score?: number;
    total_quizzes?: number;
    best_score?: number;
    last_quiz_date?: string;
  } | null;
};

export default function Profile() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [user, setUser] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editForm, setEditForm] = useState({
    display_name: '',
    bio: '',
    organization: ''
  });
  
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        navigate('/auth');
        return;
      }

      setUser(user);
      await fetchProfile(user.id);
    } catch (error) {
      console.error('Authentication error:', error);
      navigate('/auth');
    } finally {
      setLoading(false);
    }
  };

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          await createProfile(userId);
          return;
        }
        throw error;
      }

      setProfile(data);
      setEditForm({
        display_name: data.display_name || '',
        bio: data.bio || '',
        organization: data.organization || ''
      });
    } catch (error) {
      console.error('Error loading profile:', error);
      toast({
        title: "Error loading profile",
        description: "Please try again later.",
        variant: "destructive"
      });
    }
  };

  const createProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .insert({
          user_id: userId,
          display_name: user?.email?.split('@')[0] || 'User'
        })
        .select()
        .single();

      if (error) throw error;

      setProfile(data);
      setEditForm({
        display_name: data.display_name || '',
        bio: data.bio || '',
        organization: data.organization || ''
      });
    } catch (error) {
      console.error('Error creating profile:', error);
    }
  };

  const handleSave = async () => {
    if (!profile) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          display_name: editForm.display_name,
          bio: editForm.bio,
          organization: editForm.organization
        })
        .eq('user_id', profile.user_id);

      if (error) throw error;

      setProfile(prev => prev ? {
        ...prev,
        display_name: editForm.display_name,
        bio: editForm.bio,
        organization: editForm.organization
      } : null);

      setIsEditing(false);
      toast({
        title: "Profile updated",
        description: "Your information has been saved successfully.",
      });
    } catch (error) {
      console.error('Error saving profile:', error);
      toast({
        title: "Error saving profile",
        description: "Please try again later.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/auth');
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-500/20 text-red-700';
      case 'researcher': return 'bg-blue-500/20 text-blue-700';
      case 'educator': return 'bg-green-500/20 text-green-700';
      default: return 'bg-gray-500/20 text-gray-700';
    }
  };

  const getScoreLevel = (score?: number) => {
    if (!score) return { level: 'Beginner', color: 'text-gray-500' };
    if (score >= 90) return { level: 'Expert', color: 'text-purple-500' };
    if (score >= 75) return { level: 'Advanced', color: 'text-blue-500' };
    if (score >= 60) return { level: 'Intermediate', color: 'text-green-500' };
    return { level: 'Beginner', color: 'text-yellow-500' };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-amber"></div>
      </div>
    );
  }

  if (!profile || !user) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="text-center py-8">
            <p>Error loading profile</p>
            <Button onClick={() => navigate('/auth')} className="mt-4">
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Card className="mb-8">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              <Avatar className="w-24 h-24">
                <AvatarImage src={profile.avatar_url} />
                <AvatarFallback className="text-2xl bg-gradient-amber text-amber-foreground">
                  {(profile.display_name || user.email)?.[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 text-center md:text-left">
                <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
                  <h1 className="text-3xl font-bold">
                    {profile.display_name || 'User'}
                  </h1>
                  {profile.role && (
                    <Badge className={getRoleColor(profile.role)}>
                      {profile.role}
                    </Badge>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row gap-4 text-muted-foreground mb-4">
                  <span className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    {user.email}
                  </span>
                  <span className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Member since {new Date(profile.created_at).toLocaleDateString('en-US')}
                  </span>
                </div>

                {profile.bio && (
                  <p className="text-muted-foreground mb-4">{profile.bio}</p>
                )}

                {profile.organization && (
                  <p className="text-sm text-muted-foreground mb-4">
                    <strong>Organization:</strong> {profile.organization}
                  </p>
                )}

                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(!isEditing)}
                  >
                    <Edit3 className="w-4 h-4 mr-2" />
                    {isEditing ? 'Cancel' : 'Edit Profile'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSignOut}
                  >
                    Sign Out
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Edit Form */}
        {isEditing && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Edit Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Display Name</label>
                <Input
                  value={editForm.display_name}
                  onChange={(e) => setEditForm(prev => ({ ...prev, display_name: e.target.value }))}
                  placeholder="Your name"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Biography</label>
                <Textarea
                  value={editForm.bio}
                  onChange={(e) => setEditForm(prev => ({ ...prev, bio: e.target.value }))}
                  placeholder="Tell us a little about yourself..."
                  rows={3}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Organization</label>
                <Input
                  value={editForm.organization}
                  onChange={(e) => setEditForm(prev => ({ ...prev, organization: e.target.value }))}
                  placeholder="University, company, or institution"
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button onClick={handleSave} disabled={saving}>
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? 'Saving...' : 'Save'}
                </Button>
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Profile Tabs */}
        <Tabs defaultValue="stats" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="stats">Statistics</TabsTrigger>
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
          </TabsList>

          <TabsContent value="stats" className="mt-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Quiz Statistics */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-amber" />
                    Quiz Statistics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span>Best Score:</span>
                        <span className="font-bold text-amber">
                          {(profile.quiz_scores as any)?.best_score || 0}%
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Latest Score:</span>
                        <span className="font-semibold">
                          {(profile.quiz_scores as any)?.latest_score || 0}%
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Total Quizzes:</span>
                        <span className="font-semibold">
                          {(profile.quiz_scores as any)?.total_quizzes || 0}
                        </span>
                      </div>
                      {(profile.quiz_scores as any)?.last_quiz_date && (
                        <div className="flex justify-between items-center">
                          <span>Last Quiz:</span>
                          <span className="text-sm text-muted-foreground">
                            {new Date((profile.quiz_scores as any).last_quiz_date).toLocaleDateString('en-US')}
                          </span>
                        </div>
                      )}
                    </div>
                </CardContent>
              </Card>

              {/* Level Progress */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-green-500" />
                    Knowledge Level
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    {(() => {
                      const { level, color } = getScoreLevel((profile.quiz_scores as any)?.best_score);
                      return (
                        <>
                          <div className={`text-3xl font-bold mb-2 ${color}`}>
                            {level}
                          </div>
                          <p className="text-muted-foreground mb-4">
                            Based on your best score
                          </p>
                          <Button variant="outline" onClick={() => navigate('/education')}>
                            <BookOpen className="w-4 h-4 mr-2" />
                            Take a New Quiz
                          </Button>
                        </>
                      );
                    })()}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="achievements" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber" />
                  Achievements
                </CardTitle>
                <CardDescription>
                  Your achievements and milestones in learning about dinosaurs
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Achievement items would be dynamically generated */}
                  <div className="flex items-center gap-4 p-4 rounded-lg border">
                    <div className="w-12 h-12 bg-amber/20 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-amber" />
                    </div>
                    <div>
                      <h4 className="font-semibold">Welcome!</h4>
                      <p className="text-sm text-muted-foreground">
                        Created your Dino Library account
                      </p>
                    </div>
                  </div>

                  {(profile.quiz_scores as any)?.total_quizzes && (profile.quiz_scores as any).total_quizzes > 0 && (
                    <div className="flex items-center gap-4 p-4 rounded-lg border">
                      <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
                        <BookOpen className="w-6 h-6 text-green-500" />
                      </div>
                      <div>
                        <h4 className="font-semibold">First Quiz</h4>
                        <p className="text-sm text-muted-foreground">
                          Completed your first quiz
                        </p>
                      </div>
                    </div>
                  )}

                  {(profile.quiz_scores as any)?.best_score && (profile.quiz_scores as any).best_score >= 80 && (
                    <div className="flex items-center gap-4 p-4 rounded-lg border">
                      <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center">
                        <Trophy className="w-6 h-6 text-blue-500" />
                      </div>
                      <div>
                        <h4 className="font-semibold">Expert</h4>
                        <p className="text-sm text-muted-foreground">
                          Scored over 80% on a quiz
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="text-center py-8 text-muted-foreground">
                    <Award className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Keep learning to unlock more achievements!</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}