import styles from './AlertBox.module.css'
import './AlertBox.css'

export enum ALERT_TYPE {
    ERROR = 'error',
    SUCCESS = 'success',
    WARNING = 'warning',
    NOTICE = 'notice',
}
export default function AlertBox(props: {
    message: string
    type: ALERT_TYPE
    onClose?: () => void
}) {
    return (
        <div className={`${styles.alertbox} ${props.type}`}>
            <span>{props.type.toUpperCase()}: </span>
            {props.message}
        </div>
    )
}
