'use client';

import React, { useEffect } from 'react';

/**
 * 모달 컴포넌트의 Props 타입 정의
 * Design System(docs/05_DesignSystem.md) 섹션 4.6 참조
 */
interface ModalProps {
  isOpen: boolean;                     // 모달 열림 여부
  onClose: () => void;                 // 모달 닫기 핸들러
  title: string;                       // 모달 제목
  children: React.ReactNode;           // 모달 본문 내용
}

/**
 * 재사용 가능한 모달 (대화상자) 컴포넌트
 *
 * 오버레이 배경과 함께 화면 중앙에 표시되는 대화상자이다.
 * 오버레이 클릭 또는 ESC 키로 닫을 수 있다.
 *
 * @example
 * <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="확인">
 *   <p>정말 삭제하시겠습니까?</p>
 *   <Button onClick={handleDelete}>삭제</Button>
 * </Modal>
 */
export default function Modal({
  isOpen,
  onClose,
  title,
  children,
}: ModalProps) {
  // ESC 키를 누르면 모달을 닫는다
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    // 모달이 열려 있을 때만 이벤트 리스너 등록
    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      // 모달이 열리면 뒤의 스크롤을 막는다
      document.body.style.overflow = 'hidden';
    }

    // 컴포넌트 언마운트 또는 모달이 닫힐 때 정리
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // 모달이 닫혀있으면 아무것도 렌더링하지 않는다
  if (!isOpen) {
    return null;
  }

  return (
    <>
      {/* 오버레이 (반투명 검정 배경) - 클릭 시 모달 닫기 */}
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* 모달 컨테이너 (화면 중앙 정렬) */}
      <div
        className="fixed inset-0 flex items-center justify-center z-50 p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {/* 모달 박스 */}
        <div
          className="bg-surface border border-border rounded-lg p-6 max-w-md w-full shadow-2xl"
          onClick={(e) => e.stopPropagation()} // 박스 클릭 시 닫히지 않도록
        >
          {/* 모달 제목 */}
          <h2
            id="modal-title"
            className="text-2xl font-semibold text-text-primary mb-4"
          >
            {title}
          </h2>

          {/* 모달 본문 */}
          {children}
        </div>
      </div>
    </>
  );
}
