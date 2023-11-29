import { packs } from '../const'
import styles from './PackList.module.css'

export default function PackList(props: {
    selected: string
    onChange: (index: number) => void
}) {
    return (
        <>
            <div className={styles.customSelect}>
                <select
                    title="select pack"
                    size={5}
                    onChange={(e) => {
                        props.onChange(Number(e.target.value))
                    }}
                >
                    {packs.map((pack, index) => (
                        <option
                            value={index}
                            key={pack.title}
                            selected={props.selected === pack.file}
                        >
                            {pack.title}
                        </option>
                    ))}
                </select>
            </div>
        </>
    )
}
