'use client';
import React from 'react';
import Header from '@/components/Navbar/Header';
import { MOCK_ENFORCEMENT } from '@/lib/mockData';
import { Shield, CheckCircle } from 'lucide-react';

export default function EnforcementPage() {
  return (
    <div className="flex flex-col h-full w-full">
      <Header />
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        
        <div className="flex items-center justify-between">
           <div>
             <h1 className="text-2xl font-bold text-text-primary tracking-tight">Interventions & Enforcement</h1>
             <p className="text-text-secondary text-sm mt-1">Priority-ranked actionable interventions</p>
           </div>
        </div>

        <div className="panel">
           <div className="panel-header">
              <span>Recommended Actions Pipeline</span>
           </div>
           <div className="p-0">
             <table className="w-full text-left border-collapse">
               <thead>
                 <tr className="border-b border-border bg-surfaceHover/50 text-xs font-semibold text-text-muted uppercase tracking-wider">
                   <th className="p-4">Priority</th>
                   <th className="p-4">Ward ID</th>
                   <th className="p-4">Action Directive</th>
                   <th className="p-4">Est. Reduction</th>
                   <th className="p-4">Status</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-border">
                 {MOCK_ENFORCEMENT.map(enf => (
                    <tr key={enf.id} className="hover:bg-surfaceHover/30 transition-colors">
                      <td className="p-4">
                         {enf.priority === 'critical' && <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-aqi-hazardous/10 text-aqi-hazardous border border-aqi-hazardous/20 uppercase tracking-wide">Critical</span>}
                         {enf.priority === 'high' && <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-aqi-veryUnhealthy/10 text-aqi-veryUnhealthy border border-aqi-veryUnhealthy/20 uppercase tracking-wide">High</span>}
                         {enf.priority === 'medium' && <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-aqi-sensitive/10 text-aqi-sensitive border border-aqi-sensitive/20 uppercase tracking-wide">Medium</span>}
                      </td>
                      <td className="p-4 font-medium text-text-primary">{enf.wardId}</td>
                      <td className="p-4 text-sm text-text-secondary">{enf.action}</td>
                      <td className="p-4 font-bold tabular-nums text-accent-cyan">-{enf.targetReduction}%</td>
                      <td className="p-4">
                         {enf.status === 'active' ? (
                           <div className="flex items-center gap-1.5 text-accent-teal text-xs font-bold uppercase"><Shield size={14} /> Active</div>
                         ) : (
                           <div className="flex items-center gap-1.5 text-text-muted text-xs font-bold uppercase"><CheckCircle size={14} /> Pending</div>
                         )}
                      </td>
                    </tr>
                 ))}
               </tbody>
             </table>
           </div>
        </div>

      </div>
    </div>
  );
}
