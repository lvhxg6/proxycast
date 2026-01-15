/**
 * @file useWorkflow Hook
 * @description 工作流步骤状态管理 Hook
 * @module components/content-creator/hooks/useWorkflow
 */

import { useState, useCallback, useMemo, useEffect } from "react";
import {
  ThemeType,
  CreationMode,
  WorkflowStep,
  StepDefinition,
  StepResult,
  StepStatus,
} from "../types";

/**
 * 获取音乐创作工作流步骤
 * 参考 Musicify MVP 的步骤设计
 */
function getMusicWorkflowSteps(mode: CreationMode): StepDefinition[] {
  // 快速模式：3 步骤（明确需求 → 生成歌词 → 导出）
  if (mode === "fast") {
    return [
      {
        id: "spec",
        type: "clarify",
        title: "明确需求",
        description: "定义歌曲主题、风格和情感",
        aiTask: { taskType: "spec", streaming: true },
        behavior: { skippable: false, redoable: true, autoAdvance: true },
      },
      {
        id: "lyrics",
        type: "write",
        title: "生成歌词",
        description: "AI 生成完整歌词",
        aiTask: { taskType: "lyrics", streaming: true },
        behavior: { skippable: false, redoable: true, autoAdvance: false },
      },
      {
        id: "export",
        type: "adapt",
        title: "导出",
        description: "导出到 Suno/Udio 等平台",
        aiTask: { taskType: "export", streaming: true },
        behavior: { skippable: true, redoable: true, autoAdvance: false },
      },
    ];
  }

  // 引导模式：完整 7 步骤
  return [
    {
      id: "spec",
      type: "clarify",
      title: "歌曲规格",
      description: "定义歌曲类型、时长、风格",
      aiTask: { taskType: "spec", streaming: true },
      behavior: { skippable: false, redoable: true, autoAdvance: true },
    },
    {
      id: "theme",
      type: "research",
      title: "主题构思",
      description: "引导思考核心主题和故事",
      aiTask: { taskType: "theme", streaming: true },
      behavior: { skippable: false, redoable: true, autoAdvance: false },
    },
    {
      id: "mood",
      type: "research",
      title: "情绪定位",
      description: "确定情绪氛围（温暖/激昂/治愈等）",
      aiTask: { taskType: "mood", streaming: true },
      behavior: { skippable: true, redoable: true, autoAdvance: false },
    },
    {
      id: "structure",
      type: "outline",
      title: "结构设计",
      description: "设计歌曲结构（主歌/副歌/桥段）",
      aiTask: { taskType: "structure", streaming: true },
      behavior: { skippable: false, redoable: true, autoAdvance: false },
    },
    {
      id: "lyrics",
      type: "write",
      title: "歌词创作",
      description: "创作完整歌词",
      aiTask: { taskType: "lyrics", streaming: true },
      behavior: { skippable: false, redoable: true, autoAdvance: false },
    },
    {
      id: "polish",
      type: "polish",
      title: "润色优化",
      description: "押韵检查和歌词润色",
      aiTask: { taskType: "polish", streaming: true },
      behavior: { skippable: true, redoable: true, autoAdvance: false },
    },
    {
      id: "export",
      type: "adapt",
      title: "导出",
      description: "导出到 Suno/Udio 等平台",
      aiTask: { taskType: "export", streaming: true },
      behavior: { skippable: true, redoable: true, autoAdvance: false },
    },
  ];
}

/**
 * 获取海报创作工作流步骤
 */
function getPosterWorkflowSteps(mode: CreationMode): StepDefinition[] {
  // 快速模式：3 步骤（明确需求 → 生成设计 → 导出）
  if (mode === "fast") {
    return [
      {
        id: "brief",
        type: "clarify",
        title: "明确需求",
        description: "定义海报主题、尺寸和风格",
        aiTask: { taskType: "brief", streaming: true },
        behavior: { skippable: false, redoable: true, autoAdvance: true },
      },
      {
        id: "design",
        type: "write",
        title: "生成设计",
        description: "AI 生成海报设计方案",
        aiTask: { taskType: "design", streaming: true },
        behavior: { skippable: false, redoable: true, autoAdvance: false },
      },
      {
        id: "export",
        type: "adapt",
        title: "导出",
        description: "导出为图片或 PDF",
        aiTask: { taskType: "export", streaming: true },
        behavior: { skippable: true, redoable: true, autoAdvance: false },
      },
    ];
  }

  // 引导模式：5 步骤
  return [
    {
      id: "brief",
      type: "clarify",
      title: "需求分析",
      description: "明确海报目的、受众和场景",
      aiTask: { taskType: "brief", streaming: true },
      behavior: { skippable: false, redoable: true, autoAdvance: true },
    },
    {
      id: "copywriting",
      type: "research",
      title: "文案策划",
      description: "撰写海报标题和文案",
      aiTask: { taskType: "copywriting", streaming: true },
      behavior: { skippable: false, redoable: true, autoAdvance: false },
    },
    {
      id: "layout",
      type: "outline",
      title: "布局设计",
      description: "规划视觉层次和元素布局",
      aiTask: { taskType: "layout", streaming: true },
      behavior: { skippable: false, redoable: true, autoAdvance: false },
    },
    {
      id: "design",
      type: "write",
      title: "视觉设计",
      description: "生成完整海报设计",
      aiTask: { taskType: "design", streaming: true },
      behavior: { skippable: false, redoable: true, autoAdvance: false },
    },
    {
      id: "export",
      type: "adapt",
      title: "导出",
      description: "导出为图片或 PDF",
      aiTask: { taskType: "export", streaming: true },
      behavior: { skippable: true, redoable: true, autoAdvance: false },
    },
  ];
}

/**
 * 获取主题对应的工作流步骤
 */
function getWorkflowSteps(
  theme: ThemeType,
  mode: CreationMode,
): StepDefinition[] {
  // 通用对话不需要工作流
  if (theme === "general") {
    return [];
  }

  // 音乐主题：使用专门的音乐创作步骤
  if (theme === "music") {
    return getMusicWorkflowSteps(mode);
  }

  // 海报主题：使用专门的海报创作步骤
  if (theme === "poster") {
    return getPosterWorkflowSteps(mode);
  }

  // 快速模式：简化步骤（收集需求 → 生成初稿 → 迭代修改）
  if (mode === "fast") {
    return [
      {
        id: "clarify",
        type: "clarify",
        title: "明确需求",
        description: "填写创作主题和要求",
        form: {
          fields: [
            { name: "topic", label: "内容主题", type: "text", required: true },
            {
              name: "keyPoints",
              label: "核心要点",
              type: "text",
              required: false,
            },
            {
              name: "audience",
              label: "目标读者",
              type: "select",
              required: false,
              options: [
                { label: "普通大众", value: "general" },
                { label: "专业人士", value: "professional" },
                { label: "学生群体", value: "student" },
                { label: "技术开发者", value: "developer" },
              ],
            },
            {
              name: "wordCount",
              label: "字数要求",
              type: "select",
              required: false,
              options: [
                { label: "1000字左右", value: "1000" },
                { label: "2000字左右", value: "2000" },
                { label: "3000字左右", value: "3000" },
                { label: "5000字以上", value: "5000" },
              ],
            },
          ],
          submitLabel: "开始生成",
        },
        behavior: { skippable: false, redoable: true, autoAdvance: true },
      },
      {
        id: "write",
        type: "write",
        title: "生成初稿",
        description: "AI 生成完整初稿",
        aiTask: { taskType: "write", streaming: true },
        behavior: { skippable: false, redoable: true, autoAdvance: false },
      },
      {
        id: "polish",
        type: "polish",
        title: "迭代修改",
        description: "根据反馈修改完善",
        aiTask: { taskType: "polish", streaming: true },
        behavior: { skippable: true, redoable: true, autoAdvance: false },
      },
    ];
  }

  // 基础步骤定义（引导模式和其他模式）
  const baseSteps: StepDefinition[] = [
    {
      id: "clarify",
      type: "clarify",
      title: "明确需求",
      description: "确认创作主题、目标读者和风格",
      form: {
        fields: [
          { name: "topic", label: "内容主题", type: "text", required: true },
          {
            name: "audience",
            label: "目标读者",
            type: "select",
            required: false,
            options: [
              { label: "普通大众", value: "general" },
              { label: "专业人士", value: "professional" },
              { label: "学生群体", value: "student" },
              { label: "技术开发者", value: "developer" },
            ],
          },
          {
            name: "style",
            label: "内容风格",
            type: "radio",
            required: false,
            options: [
              { label: "专业严谨", value: "professional" },
              { label: "轻松活泼", value: "casual" },
              { label: "深度分析", value: "analytical" },
              { label: "故事叙述", value: "narrative" },
            ],
          },
        ],
        submitLabel: "确认并继续",
        skipLabel: "跳过",
      },
      behavior: { skippable: false, redoable: true, autoAdvance: true },
    },
    {
      id: "research",
      type: "research",
      title: "调研收集",
      description: "AI 搜索相关资料，你可以补充真实经历",
      aiTask: { taskType: "research", streaming: true },
      behavior: { skippable: true, redoable: true, autoAdvance: false },
    },
    {
      id: "outline",
      type: "outline",
      title: "生成大纲",
      description: "AI 生成内容大纲，你可以调整顺序",
      aiTask: { taskType: "outline", streaming: true },
      behavior: { skippable: false, redoable: true, autoAdvance: false },
    },
    {
      id: "write",
      type: "write",
      title: "撰写内容",
      description: "根据模式不同，AI 和你协作完成内容",
      aiTask: { taskType: "write", streaming: true },
      behavior: { skippable: false, redoable: true, autoAdvance: false },
    },
    {
      id: "polish",
      type: "polish",
      title: "润色优化",
      description: "AI 检查并建议优化",
      aiTask: { taskType: "polish", streaming: true },
      behavior: { skippable: true, redoable: true, autoAdvance: false },
    },
    {
      id: "adapt",
      type: "adapt",
      title: "适配发布",
      description: "选择目标平台，AI 自动适配格式",
      form: {
        fields: [
          {
            name: "platform",
            label: "目标平台",
            type: "checkbox",
            required: true,
            options: [
              { label: "微信公众号", value: "wechat" },
              { label: "小红书", value: "xiaohongshu" },
              { label: "知乎", value: "zhihu" },
              { label: "通用 Markdown", value: "markdown" },
            ],
          },
        ],
        submitLabel: "生成适配版本",
      },
      behavior: { skippable: true, redoable: true, autoAdvance: false },
    },
  ];

  return baseSteps;
}

/**
 * 工作流状态管理 Hook
 */
export function useWorkflow(theme: ThemeType, mode: CreationMode) {
  const [steps, setSteps] = useState<WorkflowStep[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  // 根据主题和模式初始化步骤
  useEffect(() => {
    const definitions = getWorkflowSteps(theme, mode);
    const initialSteps: WorkflowStep[] = definitions.map((def, index) => ({
      ...def,
      status: index === 0 ? "active" : "pending",
    }));
    setSteps(initialSteps);
    setCurrentStepIndex(0);
  }, [theme, mode]);

  /**
   * 当前步骤
   */
  const currentStep = useMemo(
    () => steps[currentStepIndex] || null,
    [steps, currentStepIndex],
  );

  /**
   * 进度百分比
   */
  const progress = useMemo(() => {
    if (steps.length === 0) return 0;
    const completedCount = steps.filter(
      (s) => s.status === "completed" || s.status === "skipped",
    ).length;
    return Math.round((completedCount / steps.length) * 100);
  }, [steps]);

  /**
   * 跳转到指定步骤
   */
  const goToStep = useCallback(
    (index: number) => {
      if (index >= 0 && index < steps.length) {
        // 只能跳转到已完成或当前步骤
        const targetStep = steps[index];
        if (
          targetStep.status === "completed" ||
          targetStep.status === "skipped" ||
          index === currentStepIndex
        ) {
          setCurrentStepIndex(index);
          setSteps((prev) =>
            prev.map((step, i) =>
              i === index ? { ...step, status: "active" as StepStatus } : step,
            ),
          );
        }
      }
    },
    [steps, currentStepIndex],
  );

  /**
   * 完成当前步骤
   */
  const completeStep = useCallback(
    (result: StepResult) => {
      // 使用函数式更新来获取最新的状态
      // 这样即使 AI 快速连续生成多个文件，也能正确推进步骤
      setCurrentStepIndex((prevIndex) => {
        // 标记当前步骤为完成
        setSteps((prev) =>
          prev.map((step, i) =>
            i === prevIndex
              ? { ...step, status: "completed" as StepStatus, result }
              : step,
          ),
        );

        // 计算下一步索引
        const nextIndex = prevIndex + 1;
        if (nextIndex < steps.length) {
          // 激活下一步
          setSteps((prev) =>
            prev.map((step, i) =>
              i === nextIndex
                ? { ...step, status: "active" as StepStatus }
                : step,
            ),
          );
          return nextIndex;
        }
        return prevIndex;
      });
    },
    [steps.length],
  );

  /**
   * 跳过当前步骤
   */
  const skipStep = useCallback(() => {
    const step = steps[currentStepIndex];
    if (!step?.behavior.skippable) return;

    setSteps((prev) =>
      prev.map((s, i) =>
        i === currentStepIndex ? { ...s, status: "skipped" as StepStatus } : s,
      ),
    );

    const nextIndex = currentStepIndex + 1;
    if (nextIndex < steps.length) {
      setCurrentStepIndex(nextIndex);
      setSteps((prev) =>
        prev.map((step, i) =>
          i === nextIndex ? { ...step, status: "active" as StepStatus } : step,
        ),
      );
    }
  }, [currentStepIndex, steps]);

  /**
   * 重做指定步骤
   */
  const redoStep = useCallback(
    (index: number) => {
      const step = steps[index];
      if (!step?.behavior.redoable) return;

      // 重置该步骤及之后的所有步骤
      setSteps((prev) =>
        prev.map((s, i) => {
          if (i === index) {
            return { ...s, status: "active" as StepStatus, result: undefined };
          }
          if (i > index) {
            return { ...s, status: "pending" as StepStatus, result: undefined };
          }
          return s;
        }),
      );
      setCurrentStepIndex(index);
    },
    [steps],
  );

  /**
   * 提交步骤表单
   */
  const submitStepForm = useCallback(
    (data: Record<string, unknown>) => {
      completeStep({ userInput: data });
    },
    [completeStep],
  );

  return {
    steps,
    currentStep,
    currentStepIndex,
    progress,
    canGoBack: currentStepIndex > 0,
    canGoForward: currentStepIndex < steps.length - 1,
    goToStep,
    completeStep,
    skipStep,
    redoStep,
    submitStepForm,
  };
}
