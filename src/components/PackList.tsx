import { useEffect, useRef } from 'react'
import { packs } from '../const'
import styles from './PackList.module.css'

export default function PackList(props: {
    selected: string
    onChange: (index: number) => void
}) {
    const myRef = useRef<any>()

    useEffect(() => myRef.current && myRef.current.scrollIntoView(), [])

    return (
        <>
            {' '}
            <div className={styles.customSelect}>
                {packs.map((pack, index) => (
                    <div
                        className={`${styles.customSelectItem} ${
                            pack.file === props.selected ? styles.selected : ''
                        }`}
                        ref={pack.file === props.selected ? myRef : undefined}
                        key={pack.file}
                        onClick={(e) => {
                            props.onChange(index)
                        }}
                    >
                        {pack.title}
                    </div>
                ))}
            </div>
        </>
    )
}
