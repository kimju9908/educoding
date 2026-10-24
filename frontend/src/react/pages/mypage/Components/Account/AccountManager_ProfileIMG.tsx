import React, { useState, useEffect, useRef, useCallback, JSX } from 'react';

import AddCircleIcon from '@mui/icons-material/AddCircle';
import ChangeCircleIcon from '@mui/icons-material/ChangeCircle';
import CloseIcon from '@mui/icons-material/Close';
import DoneIcon from '@mui/icons-material/Done';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import Rotate90DegreesCcwIcon from '@mui/icons-material/Rotate90DegreesCcw';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import { useTheme, Dialog, DialogActions, DialogContent, Button } from '@mui/material';
import { useMutation } from '@tanstack/react-query';
import Cropper from 'react-easy-crop';

import type { CroppedAreaPixelType, CropSizeType, CropType } from '../../MyPageType';

import MyPageApi from '../../../../../api/AxiosApi/MyPageApi/MyPageApi';
import { useAppDispatch, useAppSelector } from '../../../../../redux/hooks/reduxHooks';
import { setLoginData } from '../../../../../redux/slice/authSlice';
import {
  RightContainerEach,
  RightProfileImage,
  HiddenInput,
  ProfileEditButton,
  ProfileModal,
  ProfileModalHeader,
  ProfileModalButton,
  ProfileModalTextContainer,
  ProfileModalButtonContainer,
  ProfileModalContents,
  ProfileModalImage,
  ProfileUploadModalContainer,
  ProfileUploadModalImage,
  ProfileCropModalContainer,
  ProfileCropContainer,
  ProfileCropOverlay,
  Backdrop,
  RightNicknameBox,
  RightContentsContainer,
  RightNicknameText,
  RightNicknameIcon,
  RightNicknameInput,
  RightNicknameButton,
  NicknameErrorText,
} from '../../../../styles/mypage/MyPage_Account_ProfileIMG';

const AccountManager_ProfileIMG = (): JSX.Element => {
  const dispatch = useAppDispatch();
  const nickname = useAppSelector((state) => state.auth.nickname);
  const profile = useAppSelector((state) => state.auth.profile);
  const [preview, setPreview] = useState<string | null>(null); // 변경 프로필 이미지 용도
  const [crop, setCrop] = useState<CropType>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState<number>(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<CroppedAreaPixelType | null>(null);
  const [croppedPreview, setCroppedPreview] = useState<string | null>(null); // 미리보기 용도
  const [isProfileImgModalOpen, setIsProfileImgModalOpen] = useState<boolean>(false);
  const [isProfileUploadModalOpen, setIsProfileUploadModalOpen] = useState<boolean>(false);
  const [isProfileCropModalOpen, setIsProfileCropModalOpen] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [rotation, setRotation] = useState<number>(0);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [cropSize, setCropSize] = useState<CropSizeType>({ width: 0, height: 0 });
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [newNickname, setNewNickname] = useState<string>(nickname);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isNicknameAvailable, setIsNicknameAvailable] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);

  // 닉네임 중복 검사 실행
  useEffect(() => {
    if (newNickname && newNickname !== nickname) {
      setLoading(true);
      const checkNickname = async (): Promise<void> => {
        try {
          const response = await MyPageApi.checkNicknameAvailability(newNickname);
          setIsNicknameAvailable(response.data);
          setLoading(false);
        } catch (error) {
          console.error('에러 발생', error);
          setDialogMessage('이미 사용 중인 닉네임입니다.');
          setOpenDialog(true);
        }
      };
      checkNickname();
    }
  }, [newNickname, nickname]);

  // 닉네임 변경 요청
  const handleNicknameChange = async (): Promise<void> => {
    if (!isNicknameAvailable) {
      setDialogMessage('이미 사용 중인 닉네임입니다.');
      setOpenDialog(true);
      return;
    }

    try {
      const response = await MyPageApi.changeNickname(newNickname);
      if (response.data) {
        dispatch(setLoginData({ nickname: newNickname })); // Redux 상태 업데이트
        setIsEditing(false);
        setDialogMessage('닉네임 변경에 성공했습니다.');
        setOpenDialog(true);
      } else {
        setDialogMessage('닉네임 변경에 성공했습니다.');
        setOpenDialog(true);
      }
    } catch (error) {
      console.error('에러 발생', error);
      setDialogMessage('닉네임 변경 중 오류가 발생했습니다.');
      setOpenDialog(true);
    }
  };

  useEffect(() => {
    if (!preview) return;

    const img = new Image();
    img.src = preview;
    img.onload = (): void => {
      const { naturalWidth, naturalHeight } = img;
      const minSize = Math.min(naturalWidth, naturalHeight); // 가장 짧은 쪽 선택
      setCropSize({ width: minSize, height: minSize }); // 동적 크롭 크기 설정
    };
  }, [preview, isProfileCropModalOpen]);

  useEffect(() => {
    if (croppedPreview) {
      setPreview(croppedPreview);
    }
  }, [croppedPreview]);

  const onCropComplete = useCallback(
    (croppedArea: CropSizeType, croppedAreaPixels: CroppedAreaPixelType) => {
      setCroppedAreaPixels(croppedAreaPixels);
    },
    [],
  );

  const handleRotate = (): void => {
    setRotation((prev) => (prev - 90) % 360);
  };

  const convertUrlToFile = async (url: string, fileName: string): Promise<File> => {
    const response = await fetch(url);
    const blob = await response.blob();
    return new File([blob], fileName, { type: 'image/webp' });
  };

  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMessage, setDialogMessage] = useState<string | JSX.Element>('');

  const handleCloseDialog = (): void => {
    setOpenDialog(false);
  };

  const handleUpload = async (e: React.MouseEvent<HTMLButtonElement>): Promise<void> => {
    e.preventDefault();
    if (isSubmitting) {
      return;
    }
    setIsSubmitting(true);
    const finalImage = await convertUrlToFile(croppedPreview as string, `${nickname}_profile.webp`);
    try {
      const formData = new FormData();
      formData.append('file', finalImage);
      formData.append('fileName', `${nickname}_profile.webp`);

      const response = await MyPageApi.uploadprofile(formData);

      if (response) {
        setDialogMessage('프로필 이미지 설정이 완료되었습니다.');
        setOpenDialog(true);
        setIsProfileUploadModalOpen(false);
        setIsProfileImgModalOpen(false);
        dispatch(setLoginData({ profile: response }));
      }
    } catch (error) {
      if (error === 'Invalid ImageUrl response') {
        setDialogMessage('유효한 프로필 이미지가 아닙니다. 다시 시도해주세요.');
        setOpenDialog(true);
      }
      if (error) {
        console.error('에러 발생', error);
        setDialogMessage('다시 시도해주세요.');
        setOpenDialog(true);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent<HTMLButtonElement>): Promise<void> => {
    e.preventDefault();
    if (isSubmitting) {
      return;
    }
    setIsSubmitting(true);
    try {
      const response = await MyPageApi.deleteprofile();
      if (response.data) {
        setDialogMessage('프로필 이미지 삭제가 완료되었습니다.');
        setOpenDialog(true);
        dispatch(setLoginData({ profile: null }));
        setPreview(null);
        setCroppedPreview(null);
        setIsProfileImgModalOpen(false);
      }
    } catch (error) {
      if (error) {
        console.error('에러 발생', error);
        setDialogMessage('다시 시도해주세요.');
        setOpenDialog(true);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveCroppedImage = (): void => {
    setPreview(croppedPreview); // 최종 크롭된 이미지 적용
    setIsProfileCropModalOpen(false); // CropModal 닫기
    setRotation(0);
  };

  const handleCrop = async (): Promise<void> => {
    if (!croppedAreaPixels || !preview) return;

    const croppedImageURL = await getCroppedImg(preview, croppedAreaPixels, rotation);
    setCroppedPreview(croppedImageURL as string);
    handleSaveCroppedImage();
  };
  const getCroppedImg = async (
    imageSrc: string,
    croppedAreaPixels: CroppedAreaPixelType,
    rotation: number,
  ): Promise<string> => {
    return new Promise((resolve, reject) => {
      const newImage = new Image();
      newImage.src = imageSrc;
      newImage.crossOrigin = 'anonymous'; // CORS 문제 방지
      newImage.onload = (): void => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        const radians = (rotation * Math.PI) / 180;
        const cos = Math.cos(radians);
        const sin = Math.sin(radians);

        const { width: imageWidth, height: imageHeight } = newImage;

        const rotatedWidth = Math.abs(imageWidth * cos) + Math.abs(imageHeight * sin);
        const rotatedHeight = Math.abs(imageWidth * sin) + Math.abs(imageHeight * cos);

        canvas.width = rotatedWidth;
        canvas.height = rotatedHeight;

        ctx?.save();
        ctx?.translate(rotatedWidth / 2, rotatedHeight / 2);
        ctx?.rotate(radians);
        ctx?.drawImage(newImage, -imageWidth / 2, -imageHeight / 2, imageWidth, imageHeight);
        ctx?.restore();

        const cropX = croppedAreaPixels.x;
        const cropY = croppedAreaPixels.y;
        const cropWidth = croppedAreaPixels.width;
        const cropHeight = croppedAreaPixels.height;

        const croppedCanvas = document.createElement('canvas');
        const croppedCtx = croppedCanvas.getContext('2d');

        croppedCanvas.width = cropWidth;
        croppedCanvas.height = cropHeight;

        croppedCtx?.drawImage(
          canvas,
          cropX,
          cropY,
          cropWidth,
          cropHeight,
          0,
          0,
          cropWidth,
          cropHeight,
        );

        croppedCanvas.toBlob((blob) => {
          if (!blob) {
            reject(new Error('Canvas toBlob failed'));
            return;
          }
          resolve(URL.createObjectURL(blob)); // 실제로 이미지 넘길 때 파일 형태로 변환 필요
        }, 'image/webp');
      };

      newImage.onerror = (err): void => reject(err);
    });
  };

  const resizeImage = (file: Blob, maxWidth = 300, maxHeight = 300): Promise<Blob | null> => {
    return new Promise((resolve) => {
      const resizingImage = new Image();
      resizingImage.src = URL.createObjectURL(file);
      resizingImage.onload = (): void => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        let { width, height } = resizingImage;

        if (width > maxWidth || height > maxHeight) {
          const scale = Math.min(maxWidth / width, maxHeight / height);
          width *= scale;
          height *= scale;
        }
        canvas.width = width;
        canvas.height = height;
        ctx?.drawImage(resizingImage, 0, 0, width, height);

        canvas.toBlob((blob) => {
          resolve(blob);
        }, 'image/webp');
      };
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
    const file = e.target.files?.[0];
    fileInputRef.current = null;
    if (file) {
      const resizedBlob = await resizeImage(file);
      setPreview(URL.createObjectURL(resizedBlob as Blob));
      onClickProfileCropOpen();
    }
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>): Promise<void> => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    fileInputRef.current = null;
    if (file) {
      const resizedBlob = await resizeImage(file);
      setPreview(URL.createObjectURL(resizedBlob as Blob));
      onClickProfileCropOpen();
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (): void => setIsDragging(false);

  const onClickProfileOpen = (): void => {
    setIsProfileImgModalOpen(true);
  };
  const onClickProfileUploadOpen = (): void => {
    setIsProfileUploadModalOpen(true);
  };
  const onClickProfileCropOpen = (): void => {
    setIsProfileCropModalOpen(true);
  };
  const onClickProfileClose = (): void => {
    setIsProfileImgModalOpen(false);
  };
  const onClickProfileUploadClose = (): void => {
    setIsProfileUploadModalOpen(false);
    setPreview(null);
    setCroppedPreview(null);
    setRotation(0);
    if (fileInputRef.current) {
      fileInputRef.current = null;
    }
  };
  const onClickProfileCropClose = (): void => {
    setIsProfileCropModalOpen(false);
    setPreview(null);
    setCroppedPreview(null);
    setRotation(0);
    if (fileInputRef.current) {
      fileInputRef.current = null;
    }
  };

  const theme = useTheme();

  return (
    <>
      <RightContainerEach>
        <RightContentsContainer>
          <RightProfileImage isProfile={profile} isPreview={preview}></RightProfileImage>
          <ProfileEditButton onClick={() => onClickProfileOpen()}></ProfileEditButton>
        </RightContentsContainer>
        <RightContentsContainer>
          <RightNicknameBox onClick={() => setIsEditing(true)}>
            {isEditing ? (
              <>
                <RightNicknameInput
                  type="text"
                  value={newNickname}
                  onChange={(e) => setNewNickname(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleNicknameChange()} // 엔터 키 입력 시 변경
                />
                <RightNicknameButton
                  onClick={handleNicknameChange}
                  disabled={!isNicknameAvailable || loading}
                >
                  <RightNicknameIcon theme={theme.palette.mode} />
                </RightNicknameButton>
              </>
            ) : (
              <>
                <RightNicknameText>{nickname}</RightNicknameText>
                <RightNicknameIcon theme={theme.palette.mode} />
              </>
            )}
          </RightNicknameBox>
          {!isNicknameAvailable && (
            <NicknameErrorText>이미 사용 중인 닉네임입니다.</NicknameErrorText>
          )}
        </RightContentsContainer>
      </RightContainerEach>

      {/* 기본 프로필 이미지 등록/변경 모달 */}
      {isProfileImgModalOpen ? (
        <Backdrop onClick={onClickProfileClose}>
          <ProfileModal>
            <ProfileModalHeader>
              프로필 이미지
              <CloseIcon style={{ cursor: 'pointer' }} onClick={() => onClickProfileClose()} />
            </ProfileModalHeader>
            <ProfileModalTextContainer>
              <ProfileModalContents>
                이미지를 추가하면 다른 사람이 나를 알아보기 쉬워지며
                <br />
                내가 계정에 로그인되어 있는지 확인할 수 있습니다.
              </ProfileModalContents>
            </ProfileModalTextContainer>
            <ProfileModalImage isProfile={profile} isPreview={preview}></ProfileModalImage>

            <ProfileModalButtonContainer>
              {profile ? (
                <>
                  <Button
                    onClick={() => onClickProfileUploadOpen()}
                    variant="contained"
                    color="secondary"
                    sx={{
                      fontFamily: 'bold, sans-serif', // 폰트 패밀리 설정
                      fontSize: '12px', // 필요에 따라 폰트 크기도 설정
                      color: 'white',
                    }}
                  >
                    프로필 이미지 변경
                  </Button>
                  <Button
                    onClick={(e) => handleDelete(e)}
                    variant="contained"
                    color="secondary"
                    sx={{
                      fontFamily: 'bold, sans-serif', // 폰트 패밀리 설정
                      fontSize: '12px', // 필요에 따라 폰트 크기도 설정
                      color: 'white',
                    }}
                  >
                    프로필 이미지 삭제
                  </Button>
                </>
              ) : (
                <Button
                  startIcon={<AddCircleIcon />}
                  onClick={() => onClickProfileUploadOpen()}
                  variant="contained"
                  color="secondary"
                  sx={{
                    fontFamily: 'bold, sans-serif', // 폰트 패밀리 설정
                    fontSize: '12px', // 필요에 따라 폰트 크기도 설정
                    color: 'white',
                  }}
                >
                  프로필 이미지 추가
                </Button>
              )}
            </ProfileModalButtonContainer>
          </ProfileModal>
        </Backdrop>
      ) : null}

      {/* 프로필 이미지 추가/변경 모달 */}
      {isProfileUploadModalOpen ? (
        <Backdrop onClick={onClickProfileClose}>
          <ProfileModal>
            <ProfileModalHeader>
              {!profile ? '프로필 이미지 추가' : '프로필 이미지 변경'}
              <CloseIcon
                style={{ cursor: 'pointer' }}
                onClick={() => onClickProfileUploadClose()}
              />
            </ProfileModalHeader>
            <>
              <ProfileUploadModalContainer
                isDragging={isDragging}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <div className="drag-overlay">여기에 놓으세요</div>

                {/* 이미지 영역 */}
                <ProfileUploadModalImage isProfile={profile} isPreview={preview} />

                <HiddenInput
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  ref={fileInputRef}
                />

                {!profile && !croppedPreview ? (
                  <ProfileModalTextContainer>
                    <ProfileModalContents>여기로 이미지 드래그</ProfileModalContents>
                    <ProfileModalContents>또는</ProfileModalContents>
                  </ProfileModalTextContainer>
                ) : croppedPreview ? (
                  <>
                    <ProfileModalContents>적용된 프로필 이미지</ProfileModalContents>
                  </>
                ) : (
                  profile && (
                    <>
                      <ProfileModalContents>현재 프로필 이미지</ProfileModalContents>
                    </>
                  )
                )}
              </ProfileUploadModalContainer>

              <ProfileModalButtonContainer>
                {!profile && !croppedPreview ? (
                  <Button
                    startIcon={<UploadFileIcon />}
                    onClick={() => fileInputRef.current?.click()}
                    variant="contained"
                    color="secondary"
                    sx={{
                      fontFamily: 'bold, sans-serif', // 폰트 패밀리 설정
                      fontSize: '12px', // 필요에 따라 폰트 크기도 설정
                      color: 'white',
                    }}
                  >
                    이미지 가져오기
                  </Button>
                ) : croppedPreview ? (
                  <>
                    <Button
                      startIcon={<DoneAllIcon />}
                      onClick={(e) => handleUpload(e)}
                      variant="contained"
                      color="secondary"
                      sx={{
                        fontFamily: 'bold, sans-serif', // 폰트 패밀리 설정
                        fontSize: '12px', // 필요에 따라 폰트 크기도 설정
                        color: 'white',
                      }}
                    >
                      현재 프로필로 적용
                    </Button>
                    <Button
                      startIcon={<ChangeCircleIcon />}
                      onClick={() => fileInputRef.current?.click()}
                      variant="contained"
                      color="secondary"
                      sx={{
                        fontFamily: 'bold, sans-serif', // 폰트 패밀리 설정
                        fontSize: '12px', // 필요에 따라 폰트 크기도 설정
                        color: 'white',
                      }}
                    >
                      다른 이미지로 변경
                    </Button>
                  </>
                ) : (
                  profile && (
                    <ProfileModalButton onClick={() => fileInputRef.current?.click()}>
                      이미지 변경
                    </ProfileModalButton>
                  )
                )}
              </ProfileModalButtonContainer>
            </>
          </ProfileModal>
        </Backdrop>
      ) : null}

      {/* 프로필 이미지 업로드 이후 자르기 및 회전 모달 */}
      {isProfileCropModalOpen ? (
        <ProfileModal>
          <ProfileModalHeader>
            자르기 및 회전
            <CloseIcon style={{ cursor: 'pointer' }} onClick={() => onClickProfileCropClose()} />
          </ProfileModalHeader>
          <ProfileCropModalContainer>
            <ProfileCropContainer>
              <Cropper
                image={preview ?? undefined}
                crop={crop}
                cropShape="rect"
                style={{
                  containerStyle: { backgroundColor: 'var(--educoding-dark' }, // 컨테이너 배경색 변경
                  cropAreaStyle: {
                    border: '3px solid rgba(154, 160, 166)', // 크롭 테두리
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    maskImage: 'radial-gradient(circle, rgba(0,0,0,0.2) 69%, rgba(0,0,0,0.8) 31%)',
                    WebkitMaskImage:
                      'radial-gradient(circle, rgba(0,0,0,0.2) 69%, rgba(0,0,0,0.8) 0%)',
                  },
                }}
                showGrid={true}
                zoom={zoom}
                rotation={rotation}
                cropSize={cropSize}
                aspect={1}
                minZoom={1}
                maxZoom={5}
                zoomSpeed={0.2}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onRotationChange={setRotation}
                onCropComplete={onCropComplete}
              />
              <ProfileCropOverlay cropSize={cropSize} />
            </ProfileCropContainer>
          </ProfileCropModalContainer>
          <ProfileModalButtonContainer>
            <Button
              onClick={() => handleRotate()}
              startIcon={<Rotate90DegreesCcwIcon />}
              variant="contained"
              color="secondary"
              sx={{
                fontFamily: 'bold, sans-serif', // 폰트 패밀리 설정
                fontSize: '12px', // 필요에 따라 폰트 크기도 설정
                color: 'white',
              }}
            >
              이미지 회전
            </Button>
            <Button
              onClick={() => handleCrop()}
              startIcon={<DoneIcon />}
              variant="contained"
              color="secondary"
              sx={{
                fontFamily: 'bold, sans-serif', // 폰트 패밀리 설정
                fontSize: '12px', // 필요에 따라 폰트 크기도 설정
                color: 'white',
              }}
            >
              이미지 적용
            </Button>
          </ProfileModalButtonContainer>
        </ProfileModal>
      ) : null}

      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        PaperProps={{
          sx: {
            fontFamily: 'regular',
            minWidth: '400px', // 최소 가로 너비 설정
            maxWidth: '500px', // 최대 가로 너비 설정
          },
        }}
      >
        <DialogContent
          sx={{
            fontFamily: 'bold',
            fontSize: '14px',
            textAlign: 'center', // 가로 정렬
            display: 'flex',
            justifyContent: 'center', // 세로 정렬
            alignItems: 'center', // 세로 정렬
          }}
        >
          {dialogMessage}
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'right' }}>
          <Button sx={{ fontFamily: 'bold' }} color="secondary" onClick={handleCloseDialog}>
            닫기
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AccountManager_ProfileIMG;
