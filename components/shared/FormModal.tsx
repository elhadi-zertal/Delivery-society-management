import { Modal } from "@/components/shared/Modal";

interface FormModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    description?: string;
    children: React.ReactNode;
}

export const FormModal: React.FC<FormModalProps> = ({
    isOpen,
    onClose,
    title,
    description = "Fill in the details below.",
    children
}) => {
    return (
        <Modal
            title={title}
            description={description}
            isOpen={isOpen}
            onClose={onClose}
        >
            {children}
        </Modal>
    );
};
