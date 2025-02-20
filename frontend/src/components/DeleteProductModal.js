import React from 'react';

const DeleteProductModal = ({ isOpen, onClose, onDelete, productName, productCount }) => {
  if (!isOpen) return null;

  const handleDelete = () => {
    onDelete(); // 삭제 함수 호출
    onClose(); // 모달 닫기
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>상품 삭제</h2>
        <p>상품 {productCount}개를 선택했습니다.</p>
        <p>정말 삭제 하시겠어요?</p>
        <button onClick={handleDelete}>삭제</button>
        <button onClick={onClose}>취소</button>
      </div>
    </div>
  );
};

export default DeleteProductModal;