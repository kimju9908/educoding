package com.kh.totalproject.service;

import com.google.cloud.storage.BlobId;
import com.google.cloud.storage.BlobInfo;
import com.google.cloud.storage.Storage;
import com.google.firebase.cloud.StorageClient;
import com.kh.totalproject.entity.User;
import com.kh.totalproject.repository.UserRepository;
import com.kh.totalproject.util.SecurityUtil;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class FirebaseStorageService {

    // [local-dev] 생성 시점에 Firebase에 접속하지 않도록 지연 초기화
    private Storage storage() { return StorageClient.getInstance().bucket().getStorage(); }
    private String bucketName() { return StorageClient.getInstance().bucket().getName(); }
    private final UserRepository userRepository;

    private static final java.util.Set<String> PROFILE_IMAGE_TYPES =
            java.util.Set.of("image/png", "image/jpeg", "image/webp", "image/gif");
    private static final long PROFILE_IMAGE_MAX_BYTES = 5L * 1024 * 1024;

    // 회원가입 화면에서 고른 프로필 이미지 — 아직 회원이 아니라 사용자 폴더 대신 signup/ 아래에 저장
    public String uploadSignupProfileImage(MultipartFile file) {
        if (file == null || file.isEmpty() || !PROFILE_IMAGE_TYPES.contains(file.getContentType())) {
            throw new com.kh.totalproject.exception.InvalidValueException("PNG, JPG, WEBP, GIF 이미지만 올릴 수 있습니다.");
        }
        if (file.getSize() > PROFILE_IMAGE_MAX_BYTES) {
            throw new com.kh.totalproject.exception.InvalidValueException("이미지는 5MB 이하만 올릴 수 있습니다.");
        }
        String objectName = "upload/profile/signup/" + UUID.randomUUID();
        try {
            BlobInfo blobInfo = BlobInfo.newBuilder(BlobId.of(bucketName(), objectName))
                    .setContentType(file.getContentType())
                    .build();
            storage().create(blobInfo, file.getBytes());
        } catch (Exception e) {
            log.error("[FirebaseStorageService] 회원가입 프로필 이미지 업로드 실패", e);
            throw new IllegalStateException("프로필 이미지 업로드에 실패했습니다. 이미지 없이 가입하거나 잠시 후 다시 시도해 주세요.");
        }
        return "https://firebasestorage.googleapis.com/v0/b/" + bucketName() + "/o/"
                + objectName.replace("/", "%2F") + "?alt=media";
    }

    public String uploadFile(MultipartFile file, String fileName) throws IOException {
        Long userKey = SecurityUtil.getCurrentUserIdOrThrow();
        User user = userRepository.findById(userKey)
                .orElseThrow(() -> new RuntimeException("회원이 존재하지 않습니다."));
        String nickname = user.getNickname();
        String profileFolderName = "upload/profile";
        String objectName = profileFolderName + "/" + nickname + "/" + UUID.randomUUID() + userKey + "-" + fileName;
        String mimeType = file.getContentType();

        if (user.getProfileUrl() != null){
            String existedProfileUrl = user.getProfileUrl();
            String extractedPath = existedProfileUrl.split("o/")[1];
            String existedObjectName = extractedPath.replace("%2F", "/").replace("?alt=media", "");
            BlobId blobId = BlobId.of(bucketName(), existedObjectName);
            storage().delete(blobId);
        }

        BlobId blobId = BlobId.of(bucketName(), objectName);
        BlobInfo blobInfo = BlobInfo.newBuilder(blobId)
                .setContentType(mimeType)
                .build();
        storage().create(blobInfo, file.getBytes());

        String encodedPath = objectName.replace("/", "%2F");
        String imageUrl = "https://firebasestorage.googleapis.com/v0/b/" + bucketName() + "/o/" + encodedPath + "?alt=media";

        user.setProfileUrl(imageUrl);
        userRepository.save(user);

        return imageUrl;
    }
    public Boolean deleteFile() {
        Long userKey = SecurityUtil.getCurrentUserIdOrThrow();
        User user = userRepository.findById(userKey)
                .orElseThrow(() -> new RuntimeException("회원이 존재하지 않습니다."));
        String profileUrl = user.getProfileUrl();
        if (profileUrl != null && !profileUrl.isEmpty()) {
            String extractedPath = profileUrl.split("o/")[1];
            String objectName = extractedPath.replace("%2F", "/").replace("?alt=media", "");
            log.info(objectName);
            BlobId blobId = BlobId.of(bucketName(), objectName);
            storage().delete(blobId);
            System.out.println("기존 파일 삭제 완료 : " + objectName);
        }
        user.setProfileUrl(null);
        userRepository.save(user);

        return true;
    }
}
