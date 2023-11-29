import styles from './Modal.module.css'

export default function Modal(props: {
    title: string
    footer?: string
    show: boolean
    children: any
    onClose: () => void
}) {
    return props.show ? (
        <div id="myModal" className={styles.modal}>
            <div className={styles.modalContent}>
                <div className={styles.modalHeader}>
                    <span
                        className={styles.close}
                        onClick={() => props.onClose()}
                    >
                        &times;
                    </span>
                    <h2>{props.title}</h2>
                </div>
                <div className={styles.modalBody}>{props.children}</div>
                {props.footer && (
                    <div className="modalFooter">
                        <h3>{props.footer}</h3>
                    </div>
                )}
            </div>
        </div>
    ) : (
        <></>
    )
}
