'use client';

import { useState, useEffect, useCallback } from 'react';

interface User {
  id: string;
  name: string;
  department: string;
  phone?: string;
  email?: string;
  seedNumber?: number;
  isBye: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Tournament {
  id: string;
  name: string;
  type: string;
  matches?: any[];
}

interface Record {
  id: string;
  type: string;
  // 독립적인 참가자 정보
  playerName: string;
  department: string;
  phone?: string;
  email?: string;
  // 기록 정보
  distance: number;
  accuracy?: number;
  createdAt: string;
  updatedAt: string;
}

export function useAdminData() {
  const [users, setUsers] = useState<User[]>([]);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [records, setRecords] = useState<Record[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [usersRes, tournamentsRes, recordsRes] = await Promise.all([
        fetch('/api/users'),
        fetch('/api/tournaments'),
        fetch('/api/records')
      ]);

      if (!usersRes.ok || !tournamentsRes.ok || !recordsRes.ok) {
        throw new Error('Failed to fetch data');
      }

      const [usersData, tournamentsData, recordsData] = await Promise.all([
        usersRes.json(),
        tournamentsRes.json(),
        recordsRes.json()
      ]);

      setUsers(usersData);
      setTournaments(tournamentsData);
      setRecords(recordsData);
    } catch (error) {
      console.error('Error loading data:', error);
      setError('데이터 로딩 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }, []);

  // 시드 관련 함수들
  const assignSeed = async (userId: string, seedNumber: number) => {
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ seedNumber })
      });

      if (!response.ok) {
        throw new Error('Failed to assign seed');
      }

      const updatedUser = await response.json();
      setUsers(prev => prev.map(user => user.id === userId ? updatedUser : user));
      return updatedUser;
    } catch (error) {
      console.error('Error assigning seed:', error);
      throw error;
    }
  };

  const autoAssignSeeds = async () => {
    try {
      // 부전승이 아닌 참가자들만 필터링
      const activeUsers = users.filter(user => !user.isBye);
      
      // 시드 번호 자동 배정 (등록 순서대로)
      const updates = activeUsers.map((user, index) => ({
        userId: user.id,
        seedNumber: index + 1
      }));

      // 병렬로 업데이트
      await Promise.all(
        updates.map(({ userId, seedNumber }) => 
          assignSeed(userId, seedNumber)
        )
      );

      alert(`${activeUsers.length}명의 참가자에게 시드가 자동 배정되었습니다.`);
    } catch (error) {
      console.error('Error auto-assigning seeds:', error);
      throw error;
    }
  };

  const clearAllSeeds = async () => {
    try {
      await Promise.all(
        users.map(user => 
          fetch(`/api/users/${user.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ seedNumber: null })
          })
        )
      );

      setUsers(prev => prev.map(user => ({ ...user, seedNumber: undefined })));
      alert('모든 시드 번호가 초기화되었습니다.');
    } catch (error) {
      console.error('Error clearing seeds:', error);
      throw error;
    }
  };

  // 토너먼트 브래킷 생성
  const generateTournamentBracket = async (tournamentId: string = '1') => {
    try {
      const response = await fetch('/api/tournaments/bracket', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tournamentId })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to generate bracket');
      }

      const result = await response.json();
      
      // 토너먼트 데이터 새로고침
      await loadData();
      
      return result;
    } catch (error) {
      console.error('Error generating tournament bracket:', error);
      throw error;
    }
  };

  // 사용자 관련 함수들
  const addUser = async (userData: { name: string; department: string; phone?: string; email?: string }) => {
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });

      if (!response.ok) {
        throw new Error('Failed to create user');
      }

      const newUser = await response.json();
      setUsers(prev => [newUser, ...prev]);
      return newUser;
    } catch (error) {
      console.error('Error adding user:', error);
      throw error;
    }
  };

  const updateUser = async (userId: string, userData: { name: string; department: string; phone?: string; email?: string; seedNumber?: number }) => {
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });

      if (!response.ok) {
        throw new Error('Failed to update user');
      }

      const updatedUser = await response.json();
      setUsers(prev => prev.map(user => user.id === userId ? updatedUser : user));
      return updatedUser;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  };

  const deleteUser = async (userId: string) => {
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to delete user');
      }

      setUsers(prev => prev.filter(user => user.id !== userId));
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  };

  // 기록 관련 함수들
  const addRecord = async (recordData: { 
    name: string; 
    department: string; 
    type: 'LONGEST' | 'PUTTING' | 'NEAREST'; 
    distance: string; 
    accuracy?: string;
  }) => {
    try {
      const response = await fetch('/api/records', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(recordData)
      });

      if (!response.ok) {
        throw new Error('Failed to create record');
      }

      const newRecord = await response.json();
      setRecords(prev => [{ ...newRecord, type: recordData.type }, ...prev]);
      
      // 사용자 목록도 새로고침 (새 사용자가 생성되었을 수 있음)
      await loadData();
      
      return newRecord;
    } catch (error) {
      console.error('Error adding record:', error);
      throw error;
    }
  };

  const deleteRecord = async (recordId: string, type: 'LONGEST' | 'PUTTING' | 'NEAREST') => {
    try {
      const endpoint = type === 'LONGEST' ? '/api/longest' : 
                     type === 'PUTTING' ? '/api/putting' : 
                     '/api/nearest';
      
      const response = await fetch(`${endpoint}/${recordId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to delete record');
      }

      setRecords(prev => prev.filter(record => record.id !== recordId));
    } catch (error) {
      console.error('Error deleting record:', error);
      throw error;
    }
  };

  const addRecordByType = async (type: 'LONGEST' | 'PUTTING' | 'NEAREST', recordData: { 
    playerName: string; 
    department: string; 
    phone?: string;
    email?: string;
    distance: string; 
  }) => {
    try {
      const endpoint = type === 'LONGEST' ? '/api/longest' : 
                     type === 'PUTTING' ? '/api/putting' : 
                     '/api/nearest';
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(recordData)
      });

      if (!response.ok) {
        throw new Error('Failed to create record');
      }

      const newRecord = await response.json();
      setRecords(prev => [{ ...newRecord, type }, ...prev]);
      
      // 기록 목록 새로고침
      await loadData();
      
      return newRecord;
    } catch (error) {
      console.error('Error adding record:', error);
      throw error;
    }
  };

  // 필터링 함수들
  const getRecordsByType = (type: 'LONGEST' | 'PUTTING' | 'NEAREST') => {
    return records.filter(record => record.type === type);
  };

  const getTournamentParticipants = (tournamentId: string) => {
    // 실제 구현에서는 tournament_participants 테이블이 필요하지만
    // 현재는 모든 사용자를 반환
    return users;
  };

  const getMatchesWithUsers = (tournamentId?: string) => {
    const tournament = tournaments.find(t => t.id === tournamentId);
    return tournament?.matches || [];
  };

  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    // 데이터
    users,
    tournaments,
    records,
    loading,
    error,
    
    // 함수들
    loadData,
    addUser,
    updateUser,
    deleteUser,
    addRecord,
    addRecordByType,
    deleteRecord,
    getRecordsByType,
    getTournamentParticipants,
    getMatchesWithUsers,
    
    // 시드 관련 함수들
    assignSeed,
    autoAssignSeeds,
    clearAllSeeds,
    
    // 토너먼트 관련 함수들
    generateTournamentBracket
  };
}
