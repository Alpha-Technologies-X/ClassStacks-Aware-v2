import React, { useState, useEffect } from 'react';
import { Monitor, Globe, Clock, AlertCircle, Shield, Plus, X, Settings, LogOut, Key, Users, MessageSquare, Pause, Play, Eye, Camera, BarChart, FileText, Award, Focus, Share2, Youtube, Link as LinkIcon, Zap, Lock, Unlock } from 'lucide-react';

export default function ClassStacksDashboard() {
  const [currentUser, setCurrentUser] = useState(null);
  const [view, setView] = useState('login');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [signupData, setSignupData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    role: 'teacher',
    schoolCode: ''
  });

  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [blockedSites, setBlockedSites] = useState(['youtube.com', 'instagram.com', 'tiktok.com', 'reddit.com', 'twitter.com']);
  const [allowedSites, setAllowedSites] = useState([]);
  const [newSite, setNewSite] = useState('');
  const [ruleType, setRuleType] = useState('block');
  const [error, setError] = useState('');
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [newStudent, setNewStudent] = useState({ name: '', email: '' });
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [messageText, setMessageText] = useState('');
  const [showScreenshot, setShowScreenshot] = useState(null);
  const [classActive, setClassActive] = useState(false);
  const [focusMode, setFocusMode] = useState(false);
  const [focusSites, setFocusSites] = useState('');

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const authResult = await window.storage.get('current-user');
        if (authResult && authResult.value) {
          const user = JSON.parse(authResult.value);
          setCurrentUser(user);
          setView('classes');
          loadClasses(user);
        }
      } catch (err) {
        console.log('No user logged in');
      }
    };
    checkAuth();
  }, []);

  const loadClasses = async (user) => {
    try {
      const classesResult = await window.storage.get(`classes:${user.id}`);
      if (classesResult && classesResult.value) {
        setClasses(JSON.parse(classesResult.value));
      }
    } catch (err) {
      console.error('Error loading classes:', err);
    }
  };

  const loadClassStudents = async (classId) => {
    try {
      const keys = await window.storage.list('student:', true);
      if (keys && keys.keys) {
        const studentData = [];
        for (const key of keys.keys) {
          const result = await window.storage.get(key, true);
          if (result && result.value) {
            const student = JSON.parse(result.value);
            if (student.classId === classId) {
              studentData.push(student);
            }
          }
        }
        setStudents(studentData);
      }
    } catch (error) {
      console.log('Loading students:', error);
    }
  };

  useEffect(() => {
    if (selectedClass) {
      const interval = setInterval(() => loadClassStudents(selectedClass.id), 3000);
      return () => clearInterval(interval);
    }
  }, [selectedClass]);

  const handleLogin = async () => {
    setError('');
    try {
      const userResult = await window.storage.get(`user:${loginEmail}`);
      if (!userResult || !userResult.value) {
        setError('Account not found. Please sign up first.');
        return;
      }
      const user = JSON.parse(userResult.value);
      if (user.password !== loginPassword) {
        setError('Incorrect password');
        return;
      }
      await window.storage.set('current-user', JSON.stringify(user));
      setCurrentUser(user);
      setView('classes');
      loadClasses(user);
    } catch (err) {
      setError('Login failed. Please try again.');
    }
  };

  const handleSignup = async () => {
    setError('');
    if (!signupData.firstName || !signupData.lastName || !signupData.email || !signupData.password) {
      setError('Please fill in all fields');
      return;
    }
    if (signupData.password !== signupData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (signupData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if ((signupData.role === 'teacher' || signupData.role === 'it-admin') && !signupData.schoolCode) {
      setError('School code is required');
      return;
    }
    try {
      try {
        const existingUser = await window.storage.get(`user:${signupData.email}`);
        if (existingUser && existingUser.value) {
          setError('Account already exists');
          return;
        }
      } catch (err) {}
      if (signupData.role !== 'school-admin' && signupData.schoolCode) {
        try {
          const schoolCodeResult = await window.storage.get(`school-code:${signupData.schoolCode}`, true);
          if (!schoolCodeResult || !schoolCodeResult.value) {
            setError('Invalid school code');
            return;
          }
        } catch (err) {
          setError('Invalid school code');
          return;
        }
      }
      const newUser = {
        id: 'user-' + Date.now().toString(),
        email: signupData.email,
        password: signupData.password,
        firstName: signupData.firstName,
        lastName: signupData.lastName,
        role: signupData.role,
        schoolCode: signupData.role === 'school-admin' ? `SCH-${Math.random().toString(36).substr(2, 8).toUpperCase()}` : signupData.schoolCode,
        createdAt: new Date().toISOString()
      };
      await window.storage.set(`user:${signupData.email}`, JSON.stringify(newUser));
      await window.storage.set('current-user', JSON.stringify(newUser));
      if (signupData.role === 'school-admin') {
        await window.storage.set(`school-code:${newUser.schoolCode}`, JSON.stringify({
          code: newUser.schoolCode,
          schoolName: `${newUser.firstName} ${newUser.lastName}'s School`,
          createdBy: newUser.id,
          createdAt: new Date().toISOString()
        }), true);
      }
      setCurrentUser(newUser);
      setView('classes');
      loadClasses(newUser);
    } catch (err) {
      console.error('Signup error:', err);
      setError('Signup failed: ' + (err.message || 'Try again'));
    }
  };

  const createClass = async () => {
    const className = prompt('Enter class name (e.g., Period 3 - Math):');
    if (!className) return;
    const newClass = {
      id: 'class-' + Date.now(),
      name: className,
      teacherId: currentUser.id,
      code: 'CS-' + Math.random().toString(36).substr(2, 6).toUpperCase(),
      createdAt: new Date().toISOString(),
      active: false
    };
    const updatedClasses = [...classes, newClass];
    setClasses(updatedClasses);
    await window.storage.set(`classes:${currentUser.id}`, JSON.stringify(updatedClasses));
  };

  const startClass = async (classObj) => {
    classObj.active = true;
    setClassActive(true);
    setSelectedClass(classObj);
    setView('classroom');
    await window.storage.set(`classes:${currentUser.id}`, JSON.stringify(classes));
    loadClassStudents(classObj.id);
  };

  const endClass = async () => {
    if (selectedClass) {
      selectedClass.active = false;
      setClassActive(false);
      await window.storage.set(`classes:${currentUser.id}`, JSON.stringify(classes));
    }
  };

  const addStudent = async () => {
    if (!newStudent.name || !newStudent.email) {
      alert('Please enter student name and email');
      return;
    }
    const studentId = 'student:' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    const studentData = {
      id: studentId,
      name: newStudent.name,
      email: newStudent.email,
      classId: selectedClass.id,
      extensionCode: Math.random().toString(36).substr(2, 8).toUpperCase(),
      addedBy: currentUser.id,
      teacherName: currentUser.firstName + ' ' + currentUser.lastName,
      className: selectedClass.name,
      addedAt: new Date().toISOString(),
      currentSite: 'Not connected',
      lastActive: 'Never',
      isActive: false,
      internetPaused: false,
      screenLocked: false
    };
    try {
      await window.storage.set(studentId, JSON.stringify(studentData), true);
      setStudents([...students, studentData]);
      setNewStudent({ name: '', email: '' });
      setShowAddStudent(false);
    } catch (err) {
      alert('Failed to add student');
    }
  };

  const toggleFocus = async () => {
    const newFocus = !focusMode;
    setFocusMode(newFocus);
    if (newFocus) {
      const sites = prompt('Enter allowed sites (comma separated):');
      if (sites) {
        setFocusSites(sites);
        await window.storage.set(`focus:${selectedClass.id}`, sites, true);
      }
    } else {
      try {
        await window.storage.delete(`focus:${selectedClass.id}`, true);
      } catch (e) {}
    }
  };

  const addRule = async () => {
    if (!newSite) return;
    if (ruleType === 'block') {
      setBlockedSites([...blockedSites, newSite]);
    } else {
      setAllowedSites([...allowedSites, newSite]);
    }
    setNewSite('');
  };

  const openUrlForAll = () => {
    const url = prompt('Enter URL to open on all devices:');
    if (url) {
      alert(`Opening ${url} on all student devices`);
    }
  };

  const giveReward = (student) => {
    const duration = prompt('Reward duration (10, 30, or 60 minutes):', '10');
    if (duration) {
      alert(`Giving ${student.name} ${duration} minutes of free browsing`);
    }
  };

  const toggleStudentInternet = async (student) => {
    student.internetPaused = !student.internetPaused;
    await window.storage.set(student.id, JSON.stringify(student), true);
    setStudents([...students]);
  };

  const lockStudentScreen = async (student) => {
    student.screenLocked = !student.screenLocked;
    await window.storage.set(student.id, JSON.stringify(student), true);
    setStudents([...students]);
  };

  const sendMessage = async (student, message) => {
    if (!message) return;
    try {
      const messageData = {
        id: 'msg-' + Date.now(),
        from: currentUser.firstName + ' ' + currentUser.lastName,
        to: student.id,
        message: message,
        timestamp: new Date().toISOString()
      };
      await window.storage.set(`message:${messageData.id}`, JSON.stringify(messageData), true);
      setMessageText('');
      setSelectedStudent(null);
      alert('Message sent!');
    } catch (err) {
      alert('Failed to send message');
    }
  };

  if (view === 'login') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md border border-gray-200">
          <div className="text-center mb-8">
            <svg className="w-16 h-16 mx-auto mb-4" viewBox="0 0 200 200" fill="none">
              <rect x="60" y="80" width="35" height="70" rx="8" fill="#1e40af"/>
              <rect x="105" y="50" width="35" height="100" rx="8" fill="#3b82f6"/>
              <rect x="150" y="95" width="35" height="55" rx="8" fill="#60a5fa"/>
              <rect x="50" y="155" width="145" height="20" rx="10" fill="#1f2937"/>
            </svg>
            <h1 className="text-3xl font-bold text-gray-900">ClassStacks Aware</h1>
            <p className="text-gray-600 mt-2">Classroom Management</p>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input type="email" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleLogin()} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <input type="password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleLogin()} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          {error && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm border border-red-200">{error}</div>}
          <button onClick={handleLogin} className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition">Log In</button>
          <div className="mt-6 text-center"><button onClick={() => setView('signup')} className="text-blue-600 hover:text-blue-700 font-medium">Create Account</button></div>
        </div>
      </div>
    );
  }

  if (view === 'signup') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md border border-gray-200">
          <div className="text-center mb-6">
            <svg className="w-12 h-12 mx-auto mb-3" viewBox="0 0 200 200" fill="none">
              <rect x="60" y="80" width="35" height="70" rx="8" fill="#1e40af"/>
              <rect x="105" y="50" width="35" height="100" rx="8" fill="#3b82f6"/>
              <rect x="150" y="95" width="35" height="55" rx="8" fill="#60a5fa"/>
              <rect x="50" y="155" width="145" height="20" rx="10" fill="#1f2937"/>
            </svg>
            <h1 className="text-2xl font-bold text-gray-900">Create Account</h1>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-2">First Name</label><input type="text" value={signupData.firstName} onChange={(e) => setSignupData({...signupData, firstName: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label><input type="text" value={signupData.lastName} onChange={(e) => setSignupData({...signupData, lastName: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
          </div>
          <div className="mb-4"><label className="block text-sm font-medium text-gray-700 mb-2">Email</label><input type="email" value={signupData.email} onChange={(e) => setSignupData({...signupData, email: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
          <div className="mb-4"><label className="block text-sm font-medium text-gray-700 mb-2">Role</label><select value={signupData.role} onChange={(e) => setSignupData({...signupData, role: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"><option value="teacher">Teacher</option><option value="it-admin">IT Admin</option><option value="school-admin">School Admin</option></select></div>
          {signupData.role !== 'school-admin' && (<div className="mb-4"><label className="block text-sm font-medium text-gray-700 mb-2">School Code</label><input type="text" value={signupData.schoolCode} onChange={(e) => setSignupData({...signupData, schoolCode: e.target.value.toUpperCase()})} placeholder="From your School Admin" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>)}
          <div className="mb-4"><label className="block text-sm font-medium text-gray-700 mb-2">Password</label><input type="password" value={signupData.password} onChange={(e) => setSignupData({...signupData, password: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
          <div className="mb-6"><label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label><input type="password" value={signupData.confirmPassword} onChange={(e) => setSignupData({...signupData, confirmPassword: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
          {error && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm border border-red-200">{error}</div>}
          <button onClick={handleSignup} className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition">Create Account</button>
          <div className="mt-6 text-center"><button onClick={() => setView('login')} className="text-blue-600 hover:text-blue-700 font-medium">Back to Login</button></div>
        </div>
      </div>
    );
  }

  if (view === 'classes') {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <svg className="w-8 h-8" viewBox="0 0 200 200" fill="none">
                <rect x="60" y="80" width="35" height="70" rx="8" fill="#1e40af"/>
                <rect x="105" y="50" width="35" height="100" rx="8" fill="#3b82f6"/>
                <rect x="150" y="95" width="35" height="55" rx="8" fill="#60a5fa"/>
                <rect x="50" y="155" width="145" height="20" rx="10" fill="#1f2937"/>
              </svg>
              <div><h1 className="text-xl font-bold text-gray-900">ClassStacks Aware</h1><p className="text-sm text-gray-600">{currentUser.firstName} {currentUser.lastName}</p></div>
            </div>
            <button onClick={() => {setCurrentUser(null); setView('login');}} className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"><LogOut className="w-4 h-4" />Logout</button>
          </div>
        </div>
        <div className="p-6 max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">My Classes</h2>
            <button onClick={createClass} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"><Plus className="w-4 h-4" />New Class</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {classes.map(cls => (
              <div key={cls.id} className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-lg transition cursor-pointer" onClick={() => startClass(cls)}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2"><Monitor className="w-5 h-5 text-blue-600" /><h3 className="font-semibold text-gray-900">{cls.name}</h3></div>
                  {cls.active && <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded">Active</span>}
                </div>
                <div className="text-sm text-gray-600"><p>Code: <span className="font-mono font-bold">{cls.code}</span></p></div>
              </div>
            ))}
          </div>
          {classes.length === 0 && <div className="text-center py-12 text-gray-500"><Monitor className="w-16 h-16 mx-auto mb-4 text-gray-300" /><p>No classes yet. Create your first class!</p></div>}
        </div>
      </div>
    );
  }

  if (view === 'classroom') {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b border-gray-200 px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={() => {setView('classes'); setSelectedClass(null);}} className="text-blue-600 hover:text-blue-700">← Back</button>
              <h1 className="text-lg font-bold text-gray-900">{selectedClass?.name}</h1>
              {classActive ? <span className="px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full">Active</span> : <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm font-medium rounded-full">Ended</span>}
            </div>
            <div className="flex items-center gap-2">
              {!classActive ? <button onClick={() => setClassActive(true)} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"><Play className="w-4 h-4" />Start</button> : <button onClick={endClass} className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"><Pause className="w-4 h-4" />End</button>}
            </div>
          </div>
        </div>
        <div className="px-6 py-4 bg-white border-b border-gray-200">
          <div className="flex items-center gap-2 overflow-x-auto">
            <button onClick={openUrlForAll} className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 whitespace-nowrap text-sm"><LinkIcon className="w-4 h-4" />Open URL</button>
            <button onClick={toggleFocus} className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap text-sm ${focusMode ? 'bg-purple-600 text-white' : 'bg-gray-50 text-gray-700 hover:bg-gray-100'}`}><Focus className="w-4 h-4" />Focus</button>
            <button className="flex items-center gap-2 px-4 py-2 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 whitespace-nowrap text-sm"><Youtube className="w-4 h-4" />YouTube</button>
            <button className="flex items-center gap-2 px-4 py-2 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 whitespace-nowrap text-sm"><Share2 className="w-4 h-4" />Share</button>
            <button onClick={() => setShowAddStudent(true)} className="flex items-center gap-2 px-4 py-2 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 whitespace-nowrap text-sm"><Users className="w-4 h-4" />Add</button>
            <button className="flex items-center gap-2 px-4 py-2 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 whitespace-nowrap text-sm"><BarChart className="w-4 h-4" />Reports</button>
          </div>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Students ({students.length})</h2>
                <div className="text-sm text-gray-600">{students.filter(s => s.isActive).length} online</div>
              </div>
              {students.length === 0 ? (
                <div className="bg-white rounded-lg p-12 text-center border border-gray-200"><Users className="w-16 h-16 mx-auto mb-4 text-gray-300" /><p className="text-gray-600">No students. Click "Add" to get started.</p></div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {students.map(student => {
                    const isDistracted = blockedSites.some(site => student.currentSite?.toLowerCase().includes(site.toLowerCase()));
                    const isActive = student.isActive;
                    return (
                      <div key={student.id} className={`bg-white rounded-lg p-4 border-2 transition ${!isActive ? 'border-gray-200 opacity-60' : isDistracted ? 'border-red-400 bg-red-50' : student.screenLocked ? 'border-yellow-400 bg-yellow-50' : 'border-gray-200 hover:shadow-md'}`}>
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold text-gray-900 text-sm">{student.name}</span>
                              {isDistracted && <AlertCircle className="w-4 h-4 text-red-600" />}
                              {student.screenLocked && <Lock className="w-4 h-4 text-yellow-600" />}
                            </div>
                            <div className="text-xs text-gray-500">{student.email}</div>
                          </div>
                          <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3 mb-3 min-h-[70px] border border-gray-100">
                          <div className="text-xs text-gray-500 mb-1 flex items-center gap-1"><Globe className="w-3 h-3" />Current:</div>
                          <div className="text-sm font-medium text-gray-900 break-words">{student.currentSite || 'No activity'}</div>
                          <div className="text-xs text-gray-400 mt-1">{student.lastActive}</div>
                        </div>
                        <div className="grid grid-cols-3 gap-2 mb-2">
                          <button onClick={() => setShowScreenshot(student)} className="px-2 py-1.5 bg-blue-100 text-blue-700 rounded text-xs hover:bg-blue-200 flex items-center justify-center gap-1"><Eye className="w-3 h-3" />View</button>
                          <button onClick={() => setSelectedStudent(student)} className="px-2 py-1.5 bg-purple-100 text-purple-700 rounded text-xs hover:bg-purple-200 flex items-center justify-center gap-1"><MessageSquare className="w-3 h-3" />Chat</button>
                          <button onClick={() => giveReward(student)} className="px-2 py-1.5 bg-green-100 text-green-700 rounded text-xs hover:bg-green-200 flex items-center justify-center gap-1"><Award className="w-3 h-3" />Reward</button>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <button onClick={() => toggleStudentInternet(student)} className={`px-2 py-1.5 rounded text-xs flex items-center justify-center gap-1 ${student.internetPaused ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-red-100 text-red-700 hover:bg-red-200'}`}>{student.internetPaused ? <><Play className="w-3 h-3" />Resume</> : <><Pause className="w-3 h-3" />Pause</>}</button>
                          <button onClick={() => lockStudentScreen(student)} className={`px-2 py-1.5 rounded text-xs flex items-center justify-center gap-1 ${student.screenLocked ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>{student.screenLocked ? <><Unlock className="w-3 h-3" />Unlock</> : <><Lock className="w-3 h-3" />Lock</>}</button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            <div className="lg:col-span-1 space-y-4">
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2"><Shield className="w-5 h-5 text-red-600" />Class Rules</h3>
                <div className="mb-3">
                  <select value={ruleType} onChange={(e) => setRuleType(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm mb-2">
                    <option value="block">Block Site</option>
                    <option value="allow">Allow Site</option>
                  </select>
                  <div className="flex gap-2">
                    <input type="text" value={newSite} onChange={(e) => setNewSite(e.target.value)} placeholder="domain.com" className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                    <button onClick={addRule} className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"><Plus className="w-4 h-4" /></button>
                  </div>
                </div>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  <div className="text-xs font-semibold text-gray-700 mb-2">Blocked Sites</div>
                  {blockedSites.map(site => (
                    <div key={site} className="flex items-center justify-between p-2 bg-red-50 rounded text-xs border border-red-200">
                      <span className="text-gray-700 truncate flex-1">{site}</span>
                      <button onClick={() => setBlockedSites(blockedSites.filter(s => s !== site))} className="text-red-600 hover:text-red-800 ml-2"><X className="w-3 h-3" /></button>
                    </div>
                  ))}
                  {allowedSites.length > 0 && (
                    <>
                      <div className="text-xs font-semibold text-gray-700 mb-2 mt-3">Allowed Sites</div>
                      {allowedSites.map(site => (
                        <div key={site} className="flex items-center justify-between p-2 bg-green-50 rounded text-xs border border-green-200">
                          <span className="text-gray-700 truncate flex-1">{site}</span>
                          <button onClick={() => setAllowedSites(allowedSites.filter(s => s !== site))} className="text-green-600 hover:text-green-800 ml-2"><X className="w-3 h-3" /></button>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              </div>
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-3">Quick Actions</h3>
                <div className="space-y-2">
                  <button className="w-full px-3 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 text-sm font-medium text-left flex items-center gap-2"><Camera className="w-4 h-4" />Take Screenshots</button>
                  <button className="w-full px-3 py-2 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 text-sm font-medium text-left flex items-center gap-2"><MessageSquare className="w-4 h-4" />Broadcast Message</button>
                  <button className="w-full px-3 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 text-sm font-medium text-left flex items-center gap-2"><BarChart className="w-4 h-4" />View Reports</button>
                  <button className="w-full px-3 py-2 bg-orange-50 text-orange-700 rounded-lg hover:bg-orange-100 text-sm font-medium text-left flex items-center gap-2"><FileText className="w-4 h-4" />Export History</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {showAddStudent && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowAddStudent(false)}>
            <div className="bg-white rounded-lg p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-lg font-bold mb-4">Add Student to Class</h3>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Student Name</label>
                <input type="text" value={newStudent.name} onChange={(e) => setNewStudent({...newStudent, name: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Student Email</label>
                <input type="email" value={newStudent.email} onChange={(e) => setNewStudent({...newStudent, email: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
              </div>
              <div className="flex gap-2">
                <button onClick={addStudent} className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">Add Student</button>
                <button onClick={() => setShowAddStudent(false)} className="px-4 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300">Cancel</button>
              </div>
            </div>
          </div>
        )}

        {selectedStudent && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setSelectedStudent(null)}>
            <div className="bg-white rounded-lg p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-lg font-bold mb-4">Send Message to {selectedStudent.name}</h3>
              <textarea value={messageText} onChange={(e) => setMessageText(e.target.value)} placeholder="Type your message..." className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <div className="flex gap-2 mt-4">
                <button onClick={() => sendMessage(selectedStudent, messageText)} className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">Send</button>
                <button onClick={() => setSelectedStudent(null)} className="px-4 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300">Cancel</button>
              </div>
            </div>
          </div>
        )}

        {showScreenshot && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowScreenshot(null)}>
            <div className="bg-white rounded-lg p-6 w-full max-w-4xl" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold">{showScreenshot.name}'s Screen</h3>
                <button onClick={() => setShowScreenshot(null)} className="text-gray-500 hover:text-gray-700"><X className="w-6 h-6" /></button>
              </div>
              <div className="bg-gray-100 rounded-lg p-12 text-center border-2 border-dashed border-gray-300">
                <Monitor className="w-24 h-24 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-700 font-semibold mb-2">Currently viewing: <span className="text-blue-600">{showScreenshot.currentSite}</span></p>
                <p className="text-sm text-gray-500 mb-4">Real-time screen view requires extension permission</p>
                <div className="flex gap-4 justify-center">
                  <div className="text-center"><div className="text-2xl font-bold text-gray-900">{showScreenshot.lastActive}</div><div className="text-xs text-gray-500">Last Activity</div></div>
                  <div className="text-center"><div className="text-2xl font-bold text-gray-900">{showScreenshot.isActive ? 'Online' : 'Offline'}</div><div className="text-xs text-gray-500">Status</div></div>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-3">
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"><Camera className="w-4 h-4" />Screenshot</button>
                <button onClick={() => toggleStudentInternet(showScreenshot)} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center justify-center gap-2">{showScreenshot.internetPaused ? <><Play className="w-4 h-4" />Resume</> : <><Pause className="w-4 h-4" />Pause</>}</button>
                <button onClick={() => lockStudentScreen(showScreenshot)} className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 flex items-center justify-center gap-2">{showScreenshot.screenLocked ? <><Unlock className="w-4 h-4" />Unlock</> : <><Lock className="w-4 h-4" />Lock</>}</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
}
