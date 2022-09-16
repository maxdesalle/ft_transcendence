import { Component, Setter } from 'solid-js';

const Custom: Component<{
  onClick?: () => void;
  setBanTime: Setter<number>;
}> = (props) => {
  return (
    <div>
      <label for="my-modal" class="btn btn-xs">
        Ban
      </label>

      <input type="checkbox" id="my-modal" class="modal-toggle" />
      <div class="modal">
        <div class="modal-box form-control">
          <label for="ban_time" class="input-group">
            <span>Minutes</span>
            <input
              onInput={(e) => props.setBanTime(+e.currentTarget.value)}
              type="number"
              class="input input-bordered focus:outline-none"
              name="ban_time"
              id="ban_time"
            />
          </label>
          <div class="modal-action">
            <label for="my-modal" class="btn btn-sm">
              Close
            </label>
            <label
              onClick={props.onClick}
              for="my-modal"
              class="btn btn-success btn-sm"
            >
              Confirm
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Custom;
