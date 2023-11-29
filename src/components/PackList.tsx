import { packs } from '../const'
import styles from './PackList.module.css'

export default function PackList(props: {
    selected: string
    onChange: (index: number) => void
}) {
    const selectedPack = packs.findIndex((pack) => pack.file === props.selected)
    return (
        <>
            <div className={styles.customSelect}>
                <select
                    title="select pack"
                    size={5}
                    onChange={(e) => {
                        props.onChange(Number(e.target.value))
                    }}
                    defaultValue={selectedPack}
                >
                    {packs.map((pack, index) => (
                        <option
                            value={index}
                            key={pack.title}
                            
                        >
                            {pack.title}
                        </option>
                    ))}
                </select>
            </div>
        </>
    )
}
