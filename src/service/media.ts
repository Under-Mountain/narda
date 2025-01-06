import fs from 'fs'
import sharp from 'sharp'

export function OptimizeResources(directory: string) {
    fs.readdir(directory, (err, files) => {
        if (err) {
            console.error(`Failed to read directory: ${directory}`, err)
            return
        }

        files.forEach(file => {
            const filePath = `${directory}/${file}`
            fs.stat(filePath, (err, stats) => {
                if (err) {
                    console.error(`Failed to read file stats: ${filePath}`, err)
                    return
                }

                if (stats.isDirectory()) {
                    OptimizeResources(filePath)
                } else if (file.endsWith('.png')) {
                    const webpPath = filePath.replace('.png', '.webp')

                    fs.access(webpPath, (err) => {
                        if (err) {
                            sharp(filePath).webp({ quality: 1 })
                                .toFile(webpPath)
                                .catch((e) => { console.error(e) })
                                .then((res) => {
                                    console.log(`Compressed image created: ${webpPath}`)
                                })
                        }
                    })
                }
            })
        })
    })
}