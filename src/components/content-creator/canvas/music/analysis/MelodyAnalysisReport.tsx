/**
 * @file 旋律分析报告组件
 * @description 显示参考歌曲的旋律特征分析
 * @module components/content-creator/canvas/music/analysis/MelodyAnalysisReport
 */

import React, { memo } from "react";
import styled from "styled-components";
import { Music, TrendingUp, BarChart3, Activity } from "lucide-react";
import type { MelodyAnalysisReport } from "../hooks/useMelodyMimic";

const ReportContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 20px;
  background: var(--color-surface, #ffffff);
  border: 1px solid var(--color-border, #e5e7eb);
  border-radius: 8px;
`;

const ReportTitle = styled.h3`
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text, #1f2937);

  svg {
    width: 20px;
    height: 20px;
    color: var(--color-primary, #3b82f6);
  }
`;

const MetricsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
`;

const MetricCard = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 16px;
  background: var(--color-surface-hover, #f9fafb);
  border-radius: 6px;
`;

const MetricHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text-secondary, #6b7280);

  svg {
    width: 16px;
    height: 16px;
  }
`;

const MetricValue = styled.div`
  font-size: 24px;
  font-weight: 700;
  color: var(--color-text, #1f2937);
`;

const MetricDescription = styled.div`
  font-size: 12px;
  color: var(--color-text-secondary, #6b7280);
`;

const TrackInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px;
  background: var(--color-surface-hover, #f9fafb);
  border-radius: 6px;
`;

const TrackLabel = styled.div`
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text-secondary, #6b7280);
`;

const TrackValue = styled.div`
  font-size: 14px;
  color: var(--color-text, #1f2937);
`;

export interface MelodyAnalysisReportProps {
  /** 分析报告数据 */
  report: MelodyAnalysisReport;
}

/**
 * 旋律分析报告组件
 */
export const MelodyAnalysisReportComponent: React.FC<MelodyAnalysisReportProps> =
  memo(({ report }) => {
    const selectedTrack = report.tracks[report.selectedTrack];

    return (
      <ReportContainer>
        <ReportTitle>
          <Music />
          旋律特征分析
        </ReportTitle>

        <MetricsGrid>
          {/* 调式 */}
          <MetricCard>
            <MetricHeader>
              <Music />
              调式
            </MetricHeader>
            <MetricValue>{report.mode}</MetricValue>
            <MetricDescription>歌曲的调式和音阶类型</MetricDescription>
          </MetricCard>

          {/* BPM */}
          <MetricCard>
            <MetricHeader>
              <Activity />
              速度
            </MetricHeader>
            <MetricValue>{report.bpm} BPM</MetricValue>
            <MetricDescription>每分钟节拍数</MetricDescription>
          </MetricCard>

          {/* 拍号 */}
          <MetricCard>
            <MetricHeader>
              <BarChart3 />
              拍号
            </MetricHeader>
            <MetricValue>{report.timeSignature}</MetricValue>
            <MetricDescription>节拍时间签名</MetricDescription>
          </MetricCard>

          {/* 音域 */}
          <MetricCard>
            <MetricHeader>
              <TrendingUp />
              音域
            </MetricHeader>
            <MetricValue>{report.range} 半音</MetricValue>
            <MetricDescription>最高音与最低音的跨度</MetricDescription>
          </MetricCard>

          {/* 平均音高 */}
          <MetricCard>
            <MetricHeader>
              <BarChart3 />
              平均音高
            </MetricHeader>
            <MetricValue>{report.avgPitch.toFixed(1)}</MetricValue>
            <MetricDescription>旋律的平均音高位置</MetricDescription>
          </MetricCard>

          {/* 音程跳跃 */}
          <MetricCard>
            <MetricHeader>
              <TrendingUp />
              音程跳跃
            </MetricHeader>
            <MetricValue>
              {(report.intervalJumps * 100).toFixed(0)}%
            </MetricValue>
            <MetricDescription>大跳音程的出现频率</MetricDescription>
          </MetricCard>

          {/* 节奏复杂度 */}
          <MetricCard>
            <MetricHeader>
              <Activity />
              节奏复杂度
            </MetricHeader>
            <MetricValue>
              {(report.rhythmComplexity * 100).toFixed(0)}%
            </MetricValue>
            <MetricDescription>节奏变化的复杂程度</MetricDescription>
          </MetricCard>
        </MetricsGrid>

        {/* 选中的音轨信息 */}
        {selectedTrack && (
          <TrackInfo>
            <TrackLabel>分析音轨</TrackLabel>
            <TrackValue>
              {selectedTrack.name} ({selectedTrack.instrument}) -{" "}
              {selectedTrack.noteCount} 音符
              {selectedTrack.isVocal && " · 人声"}
            </TrackValue>
          </TrackInfo>
        )}
      </ReportContainer>
    );
  });

MelodyAnalysisReportComponent.displayName = "MelodyAnalysisReport";
