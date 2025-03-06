import React, { useEffect, useRef } from "react";
import { deleteProductImage, updateProductImage } from "../../../api/products";

const ImageOptionsModal = ({ isOpen, onClose, position, isDefaultImage, productId, onUpdateImage }) => {
  const modalRef = useRef(null);
  const fileInputRef = useRef(null); // ✅ 파일 입력 트리거를 위한 ref

  // 모달 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // ㄷESC 키 입력 시 모달 닫기
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  // 파일 업로드 핸들러
  const handleUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click(); // 파일 선택 창 열기
    }
  };

  // 이미지 업로드 처리
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const imageUrl = await updateProductImage(productId, file); // ✅ 기존 상품 이미지 업데이트

      if (imageUrl) {
        onUpdateImage(imageUrl); // 부모 상태 업데이트
      }

      onClose(); // 모달 닫기
    } catch (error) {
      console.error("이미지 업로드/업데이트 오류:", error);
    }
  };

  // 이미지 삭제 처리
  const handleDelete = async () => {
    console.log(`🛠 [이미지 삭제 요청] 상품 ID: ${productId}`);

    try {
      const success = await deleteProductImage(productId); // ✅ API 함수 호출

      if (success) {
        console.log("🛠 이미지 삭제 완료");
        onUpdateImage(null);
        onClose();
      } else {
        console.error("❌ 이미지 삭제 실패");
      }
    } catch (error) {
      console.error("이미지 삭제 오류:", error);
    }
  };

  if (!isOpen || !position) return null;

  return (
    <>
      <div
        ref={modalRef}
        className="absolute bg-white shadow-lg border rounded-md p-2 w-[120px] flex flex-col z-50"
        style={{ top: position?.top || 0, left: position?.left || 0 }}
      >
        <button className="text-sm text-gray-700 hover:bg-gray-100 p-1 rounded" onClick={handleUpload}>
          사진 업로드
        </button>
        {!isDefaultImage && (
          <button className="text-sm text-red-500 hover:bg-gray-100 p-1 rounded" onClick={handleDelete}>
            사진 삭제
          </button>
        )}
      </div>

      {/* ✅ 숨겨진 파일 업로드 input */}
      <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} />
    </>
  );
};

export default ImageOptionsModal;