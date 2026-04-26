export function Footer() {
  return (
    <footer className="bg-darker py-12">
      <div className="mx-auto max-w-[1200px] px-6 text-center">
        <p className="italic text-gray-400 text-[0.875rem]">
          Follow the White Rabbit...
        </p>
        <p className="mt-2 text-[0.8125rem] text-gray-400">
          Vyrobili jsme to my.{" "}
          <a
            href="https://whiterabbit.cz"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white transition-colors hover:text-accent"
          >
            White Rabbit
          </a>
          .
        </p>
      </div>
    </footer>
  )
}
