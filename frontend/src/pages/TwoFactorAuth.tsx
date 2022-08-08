import { useNavigate } from "solid-app-router";
import { Component, createEffect, createSignal } from "solid-js";
import { useStore } from "../store";

const TwoFactorAuth: Component = () => {
  const [state, { send2faCode }] = useStore();
  const [code, setCode] = createSignal("");
  const navigate = useNavigate();
  const onSendCode = () => {
    if (code() && send2faCode) {
      send2faCode(code());
    }
  };

  createEffect(() => {
    if (state.currentUser.twoFaConfirmed) {
      navigate("/");
    }
  });

  return (
    <div>
      <input
        type="number"
        onInput={(e) => setCode(e.currentTarget.value)}
        name="code"
        id="code"
        placeholder="enter code"
      />
      <button class="btn-primary" onClick={onSendCode}>
        Confirm
      </button>
    </div>
  );
};

export default TwoFactorAuth;
