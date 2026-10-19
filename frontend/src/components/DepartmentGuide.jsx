import React from 'react';
import { Droplets, Zap, Construction, Heart, BookOpen, FileQuestion } from 'lucide-react';

const DepartmentGuide = () => {
  const departmentInfo = [
    {
      category: 'water',
      icon: Droplets,
      department: 'Water Supply Department',
      color: '#06B6D4',
      bgColor: 'rgba(6, 182, 212, 0.1)',
      examples: [
        'Water shortage or no supply',
        'Contaminated water supply',
        'Broken water pipes or leakage',
        'Water quality issues',
        'Irregular water supply timing'
      ]
    },
    {
      category: 'electricity',
      icon: Zap,
      department: 'Electricity Department',
      color: '#F59E0B',
      bgColor: 'rgba(245, 158, 11, 0.1)',
      examples: [
        'Power outages or load shedding',
        'Damaged electric poles or wires',
        'Faulty street lights',
        'High electricity bills',
        'Voltage fluctuation issues'
      ]
    },
    {
      category: 'roads',
      icon: Construction,
      department: 'Public Works Department (PWD)',
      color: '#64748B',
      bgColor: 'rgba(100, 116, 139, 0.1)',
      examples: [
        'Potholes and damaged roads',
        'Broken footpaths or sidewalks',
        'Road construction delays',
        'Poor drainage causing waterlogging',
        'Missing road signs or markings'
      ]
    },
    {
      category: 'healthcare',
      icon: Heart,
      department: 'Health Department',
      color: '#EF4444',
      bgColor: 'rgba(239, 68, 68, 0.1)',
      examples: [
        'Lack of medical facilities',
        'Medicine shortage at clinics',
        'Unhygienic hospital conditions',
        'Inadequate ambulance services',
        'Non-functional health centers'
      ]
    },
    {
      category: 'education',
      icon: BookOpen,
      department: 'Education Department',
      color: '#8B5CF6',
      bgColor: 'rgba(139, 92, 246, 0.1)',
      examples: [
        'Shortage of teachers',
        'Poor school infrastructure',
        'Lack of educational materials',
        'Non-functional toilets in schools',
        'No electricity in classrooms'
      ]
    },
    {
      category: 'other',
      icon: FileQuestion,
      department: 'General Administration',
      color: '#6B7280',
      bgColor: 'rgba(107, 114, 128, 0.1)',
      examples: [
        'Garbage collection issues',
        'Stray animal problems',
        'Public safety concerns',
        'Illegal encroachments',
        'Any other civic issues'
      ]
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg p-6" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
        <div className="w-12 h-1 mb-4" style={{ background: '#F89820', borderRadius: '2px' }} />
        <h2 className="text-2xl font-bold mb-2" style={{ color: '#0B2545' }}>
          Department Guide
        </h2>
        <p className="text-sm font-medium" style={{ color: '#6B7280' }}>
          Select the right category when filing your complaint. Each category is handled by a specific government department.
        </p>
      </div>

      {/* Department Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {departmentInfo.map((dept) => {
          const Icon = dept.icon;
          return (
            <div
              key={dept.category}
              className="bg-white rounded-lg p-6 transition-all duration-300 hover:shadow-xl"
              style={{
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                borderLeft: `4px solid ${dept.color}`
              }}
            >
              {/* Header */}
              <div className="flex items-start gap-4 mb-4">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: dept.bgColor }}
                >
                  <Icon className="h-6 w-6" style={{ color: dept.color }} />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg mb-1" style={{ color: '#0B2545' }}>
                    {dept.department}
                  </h3>
                  <span
                    className="inline-block px-3 py-1 rounded-full text-xs font-semibold"
                    style={{
                      background: dept.bgColor,
                      color: dept.color
                    }}
                  >
                    {dept.category.toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Examples */}
              <div>
                <h4 className="font-semibold text-sm mb-3" style={{ color: '#0B2545' }}>
                  Common Issues:
                </h4>
                <ul className="space-y-2">
                  {dept.examples.map((example, index) => (
                    <li
                      key={index}
                      className="flex items-start gap-2 text-sm"
                      style={{ color: '#6B7280' }}
                    >
                      <span
                        className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0"
                        style={{ background: dept.color }}
                      />
                      <span>{example}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          );
        })}
      </div>

      {/* Info Box */}
      <div
        className="bg-blue-50 border-l-4 border-blue-500 p-5 rounded-lg"
        style={{ borderLeftColor: '#3B82F6' }}
      >
        <div className="flex items-start gap-3">
          <div className="text-2xl">💡</div>
          <div>
            <h4 className="font-semibold text-blue-900 mb-2">Filing Tips</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Choose the most relevant category for faster resolution</li>
              <li>• Include photos and location details for better understanding</li>
              <li>• Provide accurate contact information for updates</li>
              <li>• If unsure, select "Other" and describe the issue clearly</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DepartmentGuide;
