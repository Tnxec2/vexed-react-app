import { PropsWithChildren } from 'react'
import styles from './Modal.module.css'

interface PROPS {
        title?: string
        footer?: string
        show: boolean
        onClose: () => void
}
export default function Modal(props: PropsWithChildren<PROPS>) {
    return props.show ? (
        <div id="myModal" className={styles.modal}>
            <div className={styles.modalContent}>
                { props.title && <div className={styles.modalHeader}>
                    <span
                        className={styles.close}
                        onClick={() => props.onClose()}
                    >
                        &times;
                    </span> 
                    <h2>{props.title}</h2>
                </div> }
                <div className={styles.modalBody}>
                { !props.title && <span
                        className={styles.close}
                        onClick={() => props.onClose()}
                    >
                        &times;
                    </span> }
                    {props.children}
                </div>
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
