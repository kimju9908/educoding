import { JSX, useEffect, useState } from 'react';

import { useNavigate } from 'react-router-dom';

import JoinApi, { getJoinErrorMessage } from '../../../api/AxiosApi/JoinApi/JoinApi';
import { useAppDispatch } from '../../../redux/hooks/reduxHooks';
import { openLoginModal } from '../../../redux/slice/LoginModalSlice';
import {
  AvatarArea,
  AvatarBadge,
  AvatarLabel,
  Card,
  ErrorBox,
  Field,
  FieldLabel,
  Footer,
  Hint,
  Input,
  Page,
  Row,
  SideButton,
  SubmitButton,
  SubTitle,
  TextButton,
  Title,
} from '../../styles/signup/SignupCard';

// 백엔드 AuthService.PASSWORD_PATTERN 과 반드시 같은 규칙
// (여기는 즉시 안내용, 실제 방어선은 서버 — 둘 다 있어야 함)
const PASSWORD_PATTERN = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z0-9]).{10,}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^01[016789]\d{7,8}$/;

// 프로필 사진을 고르지 않았을 때 보이는 기본 아바타 (이미지 파일 없이 바로 뜨게 인라인 SVG)
const DefaultAvatar = (): JSX.Element => (
  <svg viewBox="0 0 84 84" aria-hidden="true">
    <rect width="84" height="84" fill="var(--educoding-hover)" />
    <circle cx="42" cy="33" r="15" fill="var(--educoding-muted)" opacity="0.55" />
    <path d="M14 78c3-17 15-26 28-26s25 9 28 26" fill="var(--educoding-muted)" opacity="0.55" />
  </svg>
);

type VerifyState = {
  codeSent: boolean;
  code: string;
  verified: boolean;
  busy: boolean;
  message: { text: string; tone: 'ok' | 'error' | 'muted' } | null;
};

const initialVerify: VerifyState = {
  codeSent: false,
  code: '',
  verified: false,
  busy: false,
  message: null,
};

const today = (): string => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const Signup = (): JSX.Element => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  // 1. 프로필 이미지 (선택)
  const [profileFile, setProfileFile] = useState<File | null>(null);
  const [profilePreview, setProfilePreview] = useState<string | null>(null);
  // 2. 이메일 인증
  const [email, setEmail] = useState('');
  const [emailVerify, setEmailVerify] = useState<VerifyState>(initialVerify);
  // 3~5. 이름 / 생년월일 / 닉네임
  const [name, setName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [nickname, setNickname] = useState('');
  // 6. 휴대폰 인증
  const [phone, setPhone] = useState('');
  const [phoneVerify, setPhoneVerify] = useState<VerifyState>(initialVerify);
  // 7~8. 비밀번호 / 재확인
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // 미리보기 URL 정리
  useEffect(
    () => (): void => {
      if (profilePreview) URL.revokeObjectURL(profilePreview);
    },
    [profilePreview],
  );

  const phoneDigits = phone.replace(/\D/g, '');
  const nicknameTrimmed = nickname.trim();
  const isEmailFormatOk = EMAIL_PATTERN.test(email.trim());
  const isPhoneFormatOk = PHONE_PATTERN.test(phoneDigits);
  const isNicknameOk = nicknameTrimmed.length >= 3 && nicknameTrimmed.length <= 16;
  const isPasswordValid = PASSWORD_PATTERN.test(password);
  const isPasswordConfirmed = passwordConfirm.length > 0 && password === passwordConfirm;
  const canSubmit =
    emailVerify.verified &&
    phoneVerify.verified &&
    name.trim().length > 0 &&
    birthDate.length > 0 &&
    isNicknameOk &&
    isPasswordValid &&
    isPasswordConfirmed &&
    !submitting;

  const handleProfilePick = (file: File | null): void => {
    setProfileFile(file);
    setProfilePreview(file ? URL.createObjectURL(file) : null);
  };

  // 인증 도중에 이메일/번호를 바꾸면 그 인증은 의미가 없으므로 처음부터 다시
  const handleEmailChange = (value: string): void => {
    setEmail(value);
    if (emailVerify.codeSent || emailVerify.verified) setEmailVerify(initialVerify);
  };
  const handlePhoneChange = (value: string): void => {
    setPhone(value);
    if (phoneVerify.codeSent || phoneVerify.verified) setPhoneVerify(initialVerify);
  };

  // ── 이메일 인증 ──
  const sendEmailCode = async (): Promise<void> => {
    setEmailVerify((s) => ({ ...s, busy: true, message: null }));
    try {
      await JoinApi.verifyemail({ email: email.trim() });
      setEmailVerify((s) => ({
        ...s,
        busy: false,
        codeSent: true,
        code: '',
        message: { text: '인증번호를 보냈어요. 메일함을 확인해 주세요. (3분 안에 입력)', tone: 'muted' },
      }));
    } catch (e) {
      setEmailVerify((s) => ({
        ...s,
        busy: false,
        message: { text: getJoinErrorMessage(e, '인증번호 발송에 실패했어요.'), tone: 'error' },
      }));
    }
  };

  const confirmEmailCode = async (): Promise<void> => {
    setEmailVerify((s) => ({ ...s, busy: true }));
    try {
      const { data } = await JoinApi.verifyotp({ otp: Number(emailVerify.code), email: email.trim() });
      setEmailVerify((s) =>
        data
          ? { ...s, busy: false, verified: true, message: { text: '✓ 이메일 인증 완료', tone: 'ok' } }
          : {
              ...s,
              busy: false,
              message: { text: '인증번호가 맞지 않거나 만료됐어요.', tone: 'error' },
            },
      );
    } catch (e) {
      setEmailVerify((s) => ({
        ...s,
        busy: false,
        message: { text: getJoinErrorMessage(e, '인증에 실패했어요.'), tone: 'error' },
      }));
    }
  };

  // ── 휴대폰 인증 ──
  const sendPhoneCode = async (): Promise<void> => {
    setPhoneVerify((s) => ({ ...s, busy: true, message: null }));
    try {
      await JoinApi.sendPhoneCode(phoneDigits);
      setPhoneVerify((s) => ({
        ...s,
        busy: false,
        codeSent: true,
        code: '',
        message: { text: '인증번호를 문자로 보냈어요. (10분 안에 입력)', tone: 'muted' },
      }));
    } catch (e) {
      setPhoneVerify((s) => ({
        ...s,
        busy: false,
        message: { text: getJoinErrorMessage(e, '인증번호 발송에 실패했어요.'), tone: 'error' },
      }));
    }
  };

  const confirmPhoneCode = async (): Promise<void> => {
    setPhoneVerify((s) => ({ ...s, busy: true }));
    try {
      await JoinApi.verifyPhoneCode(phoneDigits, phoneVerify.code);
      setPhoneVerify((s) => ({
        ...s,
        busy: false,
        verified: true,
        message: { text: '✓ 휴대폰 인증 완료', tone: 'ok' },
      }));
    } catch (e) {
      setPhoneVerify((s) => ({
        ...s,
        busy: false,
        message: { text: getJoinErrorMessage(e, '인증에 실패했어요.'), tone: 'error' },
      }));
    }
  };

  // ── 가입 ──
  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (!canSubmit) return;
    setError(null);
    setSubmitting(true);
    try {
      let profileUrl: string | undefined;
      if (profileFile) {
        try {
          profileUrl = await JoinApi.uploadProfileImage(profileFile);
        } catch (uploadError) {
          const proceed = window.confirm(
            `${getJoinErrorMessage(uploadError, '프로필 이미지 업로드에 실패했어요.')}\n\n이미지 없이 가입을 계속할까요?`,
          );
          if (!proceed) {
            setSubmitting(false);
            return;
          }
        }
      }
      await JoinApi.join({
        email: email.trim(),
        name: name.trim(),
        birthDate,
        nickname: nicknameTrimmed,
        phoneNumber: phoneDigits,
        password,
        profileUrl,
      });
      dispatch(openLoginModal({ prefillEmail: email.trim() }));
      navigate('/');
    } catch (err) {
      setError(getJoinErrorMessage(err, '회원가입에 실패했어요. 잠시 후 다시 시도해 주세요.'));
      setSubmitting(false);
    }
  };

  const renderVerifyBlock = (
    kind: 'email' | 'phone',
    state: VerifyState,
    setState: React.Dispatch<React.SetStateAction<VerifyState>>,
    onConfirm: () => void,
  ): JSX.Element | null =>
    state.codeSent && !state.verified ? (
      <Row>
        <Input
          inputMode="numeric"
          maxLength={6}
          placeholder="인증번호 6자리"
          value={state.code}
          onChange={(e) => setState((s) => ({ ...s, code: e.target.value.replace(/\D/g, '') }))}
          aria-label={kind === 'email' ? '이메일 인증번호' : '휴대폰 인증번호'}
        />
        <SideButton
          type="button"
          disabled={state.code.length !== 6 || state.busy}
          onClick={onConfirm}
        >
          확인
        </SideButton>
      </Row>
    ) : null;

  return (
    <Page>
      <Card onSubmit={handleSubmit} noValidate>
        <Title>회원가입</Title>
        <SubTitle>educoding과 함께 개발 공부를 시작해 보세요</SubTitle>

        {/* 1. 프로필 이미지 (선택) */}
        <AvatarArea>
          <AvatarLabel title="프로필 사진 선택">
            {profilePreview ? <img src={profilePreview} alt="프로필 미리보기" /> : <DefaultAvatar />}
            <AvatarBadge>+</AvatarBadge>
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif"
              onChange={(e) => handleProfilePick(e.target.files?.[0] ?? null)}
            />
          </AvatarLabel>
          {profileFile ? (
            <TextButton type="button" onClick={() => handleProfilePick(null)}>
              사진 지우기
            </TextButton>
          ) : (
            <Hint $tone="muted">프로필 사진 (선택)</Hint>
          )}
        </AvatarArea>

        {/* 2. 이메일 인증 */}
        <Field>
          <FieldLabel htmlFor="signup-email">이메일 (로그인 아이디)</FieldLabel>
          <Row>
            <Input
              id="signup-email"
              type="email"
              placeholder="you@example.com"
              value={email}
              disabled={emailVerify.verified}
              onChange={(e) => handleEmailChange(e.target.value)}
              autoComplete="email"
            />
            <SideButton
              type="button"
              $done={emailVerify.verified}
              disabled={emailVerify.verified || !isEmailFormatOk || emailVerify.busy}
              onClick={sendEmailCode}
            >
              {emailVerify.verified ? '인증완료' : emailVerify.codeSent ? '재발송' : '인증번호 발송'}
            </SideButton>
          </Row>
          {renderVerifyBlock('email', emailVerify, setEmailVerify, confirmEmailCode)}
          {emailVerify.message ? (
            <Hint $tone={emailVerify.message.tone}>{emailVerify.message.text}</Hint>
          ) : null}
        </Field>

        {/* 3. 이름 */}
        <Field>
          <FieldLabel htmlFor="signup-name">이름</FieldLabel>
          <Input
            id="signup-name"
            placeholder="이름"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
          />
        </Field>

        {/* 4. 생년월일 */}
        <Field>
          <FieldLabel htmlFor="signup-birth">생년월일</FieldLabel>
          <Input
            id="signup-birth"
            type="date"
            max={today()}
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
          />
        </Field>

        {/* 5. 닉네임 */}
        <Field>
          <FieldLabel htmlFor="signup-nickname">닉네임</FieldLabel>
          <Input
            id="signup-nickname"
            placeholder="커뮤니티에 보일 이름 (3~16자)"
            value={nickname}
            maxLength={16}
            $invalid={nickname.length > 0 && !isNicknameOk}
            onChange={(e) => setNickname(e.target.value)}
          />
          {nickname.length > 0 && !isNicknameOk ? (
            <Hint $tone="error">닉네임은 3~16자로 입력해 주세요.</Hint>
          ) : null}
        </Field>

        {/* 6. 휴대폰 인증 */}
        <Field>
          <FieldLabel htmlFor="signup-phone">휴대폰 번호</FieldLabel>
          <Row>
            <Input
              id="signup-phone"
              type="tel"
              inputMode="numeric"
              placeholder="- 없이 숫자만"
              value={phone}
              disabled={phoneVerify.verified}
              onChange={(e) => handlePhoneChange(e.target.value)}
              autoComplete="tel"
            />
            <SideButton
              type="button"
              $done={phoneVerify.verified}
              disabled={phoneVerify.verified || !isPhoneFormatOk || phoneVerify.busy}
              onClick={sendPhoneCode}
            >
              {phoneVerify.verified ? '인증완료' : phoneVerify.codeSent ? '재발송' : '인증번호 발송'}
            </SideButton>
          </Row>
          {renderVerifyBlock('phone', phoneVerify, setPhoneVerify, confirmPhoneCode)}
          {phoneVerify.message ? (
            <Hint $tone={phoneVerify.message.tone}>{phoneVerify.message.text}</Hint>
          ) : null}
        </Field>

        {/* 7. 비밀번호 */}
        <Field>
          <FieldLabel htmlFor="signup-password">비밀번호</FieldLabel>
          <Input
            id="signup-password"
            type="password"
            placeholder="비밀번호"
            value={password}
            $invalid={password.length > 0 && !isPasswordValid}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
          />
          <Hint $tone={password.length === 0 ? 'muted' : isPasswordValid ? 'ok' : 'error'}>
            영문, 숫자, 특수문자를 모두 포함해 10자 이상
          </Hint>
        </Field>

        {/* 8. 비밀번호 재확인 */}
        <Field>
          <FieldLabel htmlFor="signup-password-confirm">비밀번호 재확인</FieldLabel>
          <Input
            id="signup-password-confirm"
            type="password"
            placeholder="비밀번호 재확인"
            value={passwordConfirm}
            $invalid={passwordConfirm.length > 0 && !isPasswordConfirmed}
            onChange={(e) => setPasswordConfirm(e.target.value)}
            autoComplete="new-password"
          />
          {passwordConfirm.length > 0 ? (
            <Hint $tone={isPasswordConfirmed ? 'ok' : 'error'}>
              {isPasswordConfirmed ? '✓ 비밀번호가 일치해요' : '비밀번호가 일치하지 않아요'}
            </Hint>
          ) : null}
        </Field>

        {error ? <ErrorBox>{error}</ErrorBox> : null}

        <SubmitButton type="submit" disabled={!canSubmit}>
          {submitting ? '가입하는 중…' : '가입하기'}
        </SubmitButton>

        <Footer>
          이미 계정이 있으신가요?
          <button type="button" onClick={() => dispatch(openLoginModal())}>
            로그인
          </button>
        </Footer>
      </Card>
    </Page>
  );
};

export default Signup;
