import { LegacyRef, useEffect, useRef } from 'react'
import { ILevel } from '../model/level'
import styles from './LevelList.module.css'

export default function LevelList(props: {
    selected: string
    levels: ILevel[]
    onChange: (index: number) => void
}) {
    const myRef = useRef<any>()

    useEffect(() => myRef.current && myRef.current.scrollIntoView(), [])

    // $('#container').scrollTop( $('.selected').position().top - 5 );
    return (
        <>
        <div className={styles.customSelect}>
            {props.levels.map((level, index) => (
                <div 
                className={`${styles.customSelectItem} ${level.title === props.selected ? styles.selected : ''}`}
                ref={level.title === props.selected ? myRef : undefined}
                key={level.title} 
                onClick={(e) => {
                    props.onChange(level.id)
                }}>
                    <span>
                    {level.id}. {level.title}{' '}
                    </span>
                    <span>
                    {level.solved
                        ? `✔ (turns: ${level.solved.turn} / min: ${
                                level.solution.length / 2
                            }) ${
                                level.solved.turn <=
                                level.solution.length / 2
                                    ? '⭐'
                                    : ''
                            } `
                        : ''}
                    </span>
                </div>
            ))}
        </div>
        </>
    )
}
