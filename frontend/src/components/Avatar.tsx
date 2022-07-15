const Avatar = () => {
  return (
    <>
      <div class="relative w-8 h-8 bg-gray-100 rounded-full dark:bg-gray-600">
        <svg
          class="w-8 h-8 bg-gray-100 rounded-full text-gray-400"
          fill="currentColor"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fill-rule="evenodd"
            d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
            clip-rule="evenodd"
          ></path>
        </svg>
        <span
          aria-hidden="true"
          class="absolute top-0 right-0 w-2 h-2 bg-green-500 rounded-full ring ring-white"
        ></span>
      </div>
    </>
  );
};

export default Avatar;
