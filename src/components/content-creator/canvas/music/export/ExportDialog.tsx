/**
 * @file 导出对话框组件
 * @description 提供多种格式的导出选项
 * @module components/content-creator/canvas/music/export/ExportDialog
 */

import React, { memo, useState, useCallback } from "react";
import styled from "styled-components";
import { Download, Copy, FileText, FileJson, Music } from "lucide-react";
import type { MusicSection, SongSpec } from "../types";
import { useMusicExport } from "../hooks/useMusicExport";

const DialogOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const DialogContainer = styled.div`
  width: 90%;
  max-width: 600px;
  max-height: 80vh;
  background: var(--color-surface, #ffffff);
  border-radius: 12px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
`;

const DialogHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid var(--color-border, #e5e7eb);
`;

const DialogTitle = styled.h2`
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--color-text, #1f2937);
`;

const CloseButton = styled.button`
  padding: 8px;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: var(--color-text-secondary, #6b7280);
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: var(--color-surface-hover, #f3f4f6);
  }
`;

const DialogContent = styled.div`
  flex: 1;
  padding: 24px;
  overflow-y: auto;
`;

const FormatGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
`;

const FormatCard = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 20px;
  border: 2px solid var(--color-border, #e5e7eb);
  border-radius: 8px;
  background: var(--color-surface, #ffffff);
  transition: all 0.2s ease;

  &:hover {
    border-color: var(--color-primary, #3b82f6);
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  }
`;

const FormatHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const FormatIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: var(--color-primary-light, #eff6ff);
  color: var(--color-primary, #3b82f6);

  svg {
    width: 20px;
    height: 20px;
  }
`;

const FormatInfo = styled.div`
  flex: 1;
`;

const FormatName = styled.div`
  font-size: 15px;
  font-weight: 600;
  color: var(--color-text, #1f2937);
`;

const FormatDescription = styled.div`
  font-size: 13px;
  color: var(--color-text-secondary, #6b7280);
`;

const FormatActions = styled.div`
  display: flex;
  gap: 8px;
`;

const ActionButton = styled.button`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px 12px;
  border: 1px solid var(--color-border, #e5e7eb);
  border-radius: 6px;
  background: var(--color-surface, #ffffff);
  color: var(--color-text, #1f2937);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: var(--color-surface-hover, #f3f4f6);
    border-color: var(--color-primary, #3b82f6);
  }

  svg {
    width: 14px;
    height: 14px;
  }
`;

const SuccessMessage = styled.div`
  padding: 12px;
  margin-top: 16px;
  border-radius: 6px;
  background: var(--color-success-light, #dcfce7);
  color: var(--color-success, #16a34a);
  font-size: 14px;
  text-align: center;
`;

export interface ExportDialogProps {
  /** 是否显示 */
  isOpen: boolean;
  /** 段落列表 */
  sections: MusicSection[];
  /** 歌曲规格 */
  spec: SongSpec;
  /** 关闭回调 */
  onClose: () => void;
}

/**
 * 导出对话框组件
 */
export const ExportDialog: React.FC<ExportDialogProps> = memo(
  ({ isOpen, sections, spec, onClose }) => {
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const {
      exportSuno,
      exportText,
      exportMarkdown,
      exportJSON,
      downloadFile,
      copyToClipboard,
    } = useMusicExport();

    const handleCopy = useCallback(
      async (format: string, getContent: () => string) => {
        try {
          const content = getContent();
          await copyToClipboard(content);
          setSuccessMessage(`已复制 ${format} 格式到剪贴板`);
          setTimeout(() => setSuccessMessage(null), 3000);
        } catch (err) {
          console.error("Copy failed:", err);
        }
      },
      [copyToClipboard],
    );

    const handleDownload = useCallback(
      (
        format: string,
        getContent: () => string,
        extension: string,
        mimeType: string,
      ) => {
        try {
          const content = getContent();
          const filename = `${spec.title || "untitled"}.${extension}`;
          downloadFile(content, filename, mimeType);
          setSuccessMessage(`已下载 ${format} 文件`);
          setTimeout(() => setSuccessMessage(null), 3000);
        } catch (err) {
          console.error("Download failed:", err);
        }
      },
      [spec.title, downloadFile],
    );

    if (!isOpen) return null;

    return (
      <DialogOverlay onClick={onClose}>
        <DialogContainer onClick={(e) => e.stopPropagation()}>
          <DialogHeader>
            <DialogTitle>导出作品</DialogTitle>
            <CloseButton onClick={onClose}>✕</CloseButton>
          </DialogHeader>

          <DialogContent>
            <FormatGrid>
              {/* Suno 格式 */}
              <FormatCard>
                <FormatHeader>
                  <FormatIcon>
                    <Music />
                  </FormatIcon>
                  <FormatInfo>
                    <FormatName>Suno AI</FormatName>
                    <FormatDescription>AI 音乐生成平台</FormatDescription>
                  </FormatInfo>
                </FormatHeader>
                <FormatActions>
                  <ActionButton
                    onClick={() =>
                      handleCopy("Suno", () => {
                        const result = exportSuno(sections, spec);
                        return `${result.lyrics}\n\n---\nStyle: ${result.style}\nTags: ${result.tags.join(", ")}`;
                      })
                    }
                  >
                    <Copy />
                    复制
                  </ActionButton>
                  <ActionButton
                    onClick={() =>
                      handleDownload(
                        "Suno",
                        () => {
                          const result = exportSuno(sections, spec);
                          return `${result.lyrics}\n\n---\nStyle: ${result.style}\nTags: ${result.tags.join(", ")}`;
                        },
                        "txt",
                        "text/plain",
                      )
                    }
                  >
                    <Download />
                    下载
                  </ActionButton>
                </FormatActions>
              </FormatCard>

              {/* 纯文本格式 */}
              <FormatCard>
                <FormatHeader>
                  <FormatIcon>
                    <FileText />
                  </FormatIcon>
                  <FormatInfo>
                    <FormatName>纯文本</FormatName>
                    <FormatDescription>简单的文本格式</FormatDescription>
                  </FormatInfo>
                </FormatHeader>
                <FormatActions>
                  <ActionButton
                    onClick={() =>
                      handleCopy("纯文本", () => exportText(sections, spec))
                    }
                  >
                    <Copy />
                    复制
                  </ActionButton>
                  <ActionButton
                    onClick={() =>
                      handleDownload(
                        "纯文本",
                        () => exportText(sections, spec),
                        "txt",
                        "text/plain",
                      )
                    }
                  >
                    <Download />
                    下载
                  </ActionButton>
                </FormatActions>
              </FormatCard>

              {/* Markdown 格式 */}
              <FormatCard>
                <FormatHeader>
                  <FormatIcon>
                    <FileText />
                  </FormatIcon>
                  <FormatInfo>
                    <FormatName>Markdown</FormatName>
                    <FormatDescription>支持格式化的文本</FormatDescription>
                  </FormatInfo>
                </FormatHeader>
                <FormatActions>
                  <ActionButton
                    onClick={() =>
                      handleCopy("Markdown", () =>
                        exportMarkdown(sections, spec),
                      )
                    }
                  >
                    <Copy />
                    复制
                  </ActionButton>
                  <ActionButton
                    onClick={() =>
                      handleDownload(
                        "Markdown",
                        () => exportMarkdown(sections, spec),
                        "md",
                        "text/markdown",
                      )
                    }
                  >
                    <Download />
                    下载
                  </ActionButton>
                </FormatActions>
              </FormatCard>

              {/* JSON 格式 */}
              <FormatCard>
                <FormatHeader>
                  <FormatIcon>
                    <FileJson />
                  </FormatIcon>
                  <FormatInfo>
                    <FormatName>JSON</FormatName>
                    <FormatDescription>结构化数据格式</FormatDescription>
                  </FormatInfo>
                </FormatHeader>
                <FormatActions>
                  <ActionButton
                    onClick={() =>
                      handleCopy("JSON", () => exportJSON(sections, spec))
                    }
                  >
                    <Copy />
                    复制
                  </ActionButton>
                  <ActionButton
                    onClick={() =>
                      handleDownload(
                        "JSON",
                        () => exportJSON(sections, spec),
                        "json",
                        "application/json",
                      )
                    }
                  >
                    <Download />
                    下载
                  </ActionButton>
                </FormatActions>
              </FormatCard>
            </FormatGrid>

            {successMessage && (
              <SuccessMessage>{successMessage}</SuccessMessage>
            )}
          </DialogContent>
        </DialogContainer>
      </DialogOverlay>
    );
  },
);

ExportDialog.displayName = "ExportDialog";
