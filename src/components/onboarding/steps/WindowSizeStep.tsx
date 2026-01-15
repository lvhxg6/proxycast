/**
 * 初次安装引导 - 窗口尺寸选择
 */

import styled from "styled-components";
import { Check } from "lucide-react";
import { windowSizeOptions, type WindowSizePreference } from "../constants";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 32px 24px;
`;

const Title = styled.h2`
  font-size: 24px;
  font-weight: 600;
  color: hsl(var(--foreground));
  margin-bottom: 8px;
  text-align: center;
`;

const Subtitle = styled.p`
  font-size: 14px;
  color: hsl(var(--muted-foreground));
  margin-bottom: 32px;
  text-align: center;
`;

const OptionsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  width: 100%;
  max-width: 500px;
`;

const OptionCard = styled.button<{ $selected?: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px 16px;
  border-radius: 12px;
  border: 2px solid
    ${({ $selected }) =>
      $selected ? "hsl(var(--primary))" : "hsl(var(--border))"};
  background: ${({ $selected }) =>
    $selected ? "hsl(var(--primary) / 0.05)" : "hsl(var(--card))"};
  cursor: pointer;
  transition: all 0.2s;
  position: relative;

  &:hover {
    border-color: ${({ $selected }) =>
      $selected ? "hsl(var(--primary))" : "hsl(var(--primary) / 0.5)"};
  }
`;

const CheckBadge = styled.div`
  position: absolute;
  top: 10px;
  right: 10px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: hsl(var(--primary));
  display: flex;
  align-items: center;
  justify-content: center;

  svg {
    width: 12px;
    height: 12px;
    color: hsl(var(--primary-foreground));
  }
`;

const IconWrapper = styled.div<{ $selected?: boolean }>`
  width: 48px;
  height: 48px;
  border-radius: 10px;
  background: ${({ $selected }) =>
    $selected ? "hsl(var(--primary))" : "hsl(var(--muted))"};
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
  transition: all 0.2s;

  svg {
    width: 24px;
    height: 24px;
    color: ${({ $selected }) =>
      $selected ? "hsl(var(--primary-foreground))" : "hsl(var(--foreground))"};
  }
`;

const OptionName = styled.span`
  font-size: 14px;
  font-weight: 600;
  color: hsl(var(--foreground));
  margin-bottom: 4px;
`;

const OptionDescription = styled.span`
  font-size: 11px;
  color: hsl(var(--muted-foreground));
  text-align: center;
`;

interface WindowSizeStepProps {
  selectedSize: WindowSizePreference | null;
  onSelect: (size: WindowSizePreference) => void;
}

export function WindowSizeStep({
  selectedSize,
  onSelect,
}: WindowSizeStepProps) {
  return (
    <Container>
      <Title>选择窗口大小</Title>
      <Subtitle>您可以随时在设置中更改窗口大小</Subtitle>

      <OptionsGrid>
        {windowSizeOptions.map((option) => {
          const isSelected = selectedSize === option.id;
          const Icon = option.icon;

          return (
            <OptionCard
              key={option.id}
              $selected={isSelected}
              onClick={() => onSelect(option.id)}
            >
              {isSelected && (
                <CheckBadge>
                  <Check />
                </CheckBadge>
              )}
              <IconWrapper $selected={isSelected}>
                <Icon />
              </IconWrapper>
              <OptionName>{option.name}</OptionName>
              <OptionDescription>{option.description}</OptionDescription>
            </OptionCard>
          );
        })}
      </OptionsGrid>
    </Container>
  );
}
