import { ILevel } from '../model/level'
import styles from './LevelList.module.css'

export default function LevelList(props: {
    selected: string
    levels: ILevel[]
    onChange: (index: number) => void
}) {
    return (
        <>
            <div className={styles.customSelect}>
                <select
                    title="select title"
                    size={10}
                    onChange={(e) => {
                        props.onChange(Number(e.target.value))
                    }}
                >
                    {props.levels.map((level, index) => (
                        <option
                            value={index}
                            key={level.title}
                            selected={props.selected === level.title}
                        >
                            {level.title}
                        </option>
                    ))}
                </select>
            </div>
        </>
    )
}
