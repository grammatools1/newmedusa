import { Dialog, Transition } from "@headlessui/react"
import { ModalProvider, useModal } from "components/context/modal-context"
import X from "components/checkout/common/icons/x"
import clsx from "clsx"
import React, { Fragment } from "react"

type ModalProps = {
  isOpen: boolean
  close: () => void
  size?: "small" | "medium" | "large"
  children: React.ReactNode
}

const Modal: React.FC<ModalProps> & {
  Title: React.FC
  Description: React.FC
  Body: React.FC
  Footer: React.FC
} = ({ isOpen, close, size = "medium", children }) => {
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-[75]" onClose={close}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-700 bg-opacity-75 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel
                className={clsx(
                  "flex flex-col justify-start w-full h-full transform overflow-auto bg-white p-10 text-left align-middle shadow-xl transition-all max-h-[65vh]",
                  {
                    "max-w-md": size === "small",
                    "max-w-xl": size === "medium",
                    "max-w-3xl": size === "large",
                  }
                )}
              >
                <ModalProvider close={close}>{children}</ModalProvider>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}

const Title: React.FC<React.HTMLProps<HTMLDivElement>> = ({ children }) => {
  const { close } = useModal();
  return (
    <Dialog.Title className="flex items-center justify-between">
      <div className="text-large-semi">{children}</div>
      <div>
        <button onClick={close}>
          <X size={20} />
        </button>
      </div>
    </Dialog.Title>
  );
};

const Description: React.FC<React.HTMLProps<HTMLDivElement>> = ({ children }) => {
  const { close } = useModal();
  return (
    <Dialog.Description className="flex text-small-regular text-gray-700 items-center justify-center pt-2 pb-4 h-full">
      {children}
    </Dialog.Description>
  );
};

const Body: React.FC<React.HTMLProps<HTMLDivElement>> = ({ children }) => {
  const { close } = useModal();
  return <div className="flex-1">{children}</div>;
};

const Footer: React.FC<React.HTMLProps<HTMLDivElement>> = ({ children }) => {
  const { close } = useModal();
  return <div className="flex items-center justify-end gap-x-4">{children}</div>;
};

Modal.Title = Title as React.FC; // Explicitly cast to React.FC
Modal.Description = Description as React.FC; // Explicitly cast to React.FC
Modal.Body = Body as React.FC; // Explicitly cast to React.FC
Modal.Footer = Footer as React.FC; // Explicitly cast to React.FC


export default Modal
